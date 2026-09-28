import { normalizeConstraints } from "./eligibility.js";
import { generatePlanOptions, newPlanId } from "./planner.js";
import { track, trackBloom, attributionPayload } from "./analytics.js";
import { mintInviteToken, mintShareToken, parseAttributionFromLocation } from "./attribution.js";

const STORAGE_KEY = "he-product-prototype-v1";

export const ONBOARDING_STEPS = [
  "welcome",
  "household",
  "members",
  "dietary",
  "taste",
  "invite",
  "ready",
];

const DEFAULT_STATE = {
  version: 1,
  onboarded: false,
  onboardingStep: "welcome",
  household: null,
  plans: [],
  activePlanId: null,
  tasteModel: {
    version: 1,
    signals: [],
    lastUpdated: null,
  },
  attribution: {
    inboundHeInv: null,
    inboundHeShare: null,
    inviteToken: null,
    lastShareToken: null,
  },
};

export function applyInboundAttribution(search) {
  const state = loadState();
  const inbound = parseAttributionFromLocation(search);
  let changed = false;
  if (inbound.heInv && inbound.heInv !== state.attribution.inboundHeInv) {
    state.attribution.inboundHeInv = inbound.heInv;
    trackBloom("HE-INV", { action: "inbound_open", token: inbound.heInv });
    changed = true;
  }
  if (inbound.heShare && inbound.heShare !== state.attribution.inboundHeShare) {
    state.attribution.inboundHeShare = inbound.heShare;
    trackBloom("HE-SHARE", { action: "inbound_open", token: inbound.heShare });
    changed = true;
  }
  if (changed) saveState(state);
  return state;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch (_) {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(DEFAULT_STATE);
}

export function createHouseholdId(name, synthetic = false) {
  if (synthetic) return "SYN-DEMO-001";
  const slug = String(name || "home")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 12);
  return `HH-${slug}-${Date.now().toString(36).slice(-4)}`;
}

/** Pre-built walkthrough household — clearly synthetic. */
export function seedSyntheticHousehold() {
  const constraints = normalizeConstraints({
    dairy: true,
    shellfish: true,
    meat_non_fish: true,
    poultry: true,
    other_nuts: true,
    cashews_ok: true,
  });
  const household = {
    id: "SYN-DEMO-001",
    name: "SYN Demo Kitchen",
    synthetic: true,
    members: [
      { id: "m1", name: "Alex" },
      { id: "m2", name: "Jordan" },
    ],
    constraints,
    taste: {
      likes: ["bowls", "curries"],
      avoids: [],
      spice: "medium",
      protein: "plants",
      time: "quick",
    },
    createdAt: new Date().toISOString(),
  };
  const state = loadState();
  state.household = household;
  state.onboardingStep = "ready";
  state.onboarded = true;
  state.plans = [];
  state.activePlanId = null;
  state.tasteModel = {
    version: 1,
    signals: [{ note: "Synthetic demo baseline — not HH001 evidence", ts: new Date().toISOString() }],
    lastUpdated: new Date().toISOString(),
  };
  saveState(state);
  track("onboard_complete", { householdId: household.id, synthetic: true });
  return state;
}

export function initHousehold(name) {
  const state = loadState();
  const householdId = createHouseholdId(name, false);
  state.household = {
    id: householdId,
    name: name.trim() || "Our household",
    synthetic: false,
    members: [],
    constraints: normalizeConstraints({}),
    taste: { likes: [], avoids: [], spice: "medium", protein: "any", time: "any" },
    createdAt: new Date().toISOString(),
  };
  state.attribution.inviteToken = mintInviteToken(householdId);
  state.onboardingStep = "members";
  saveState(state);
  return state;
}

export function setMembers(members) {
  const state = loadState();
  if (!state.household) return state;
  state.household.members = members.filter((m) => m.name.trim()).map((m, i) => ({
    id: m.id || `m${i + 1}`,
    name: m.name.trim(),
  }));
  if (state.household.members.length < 1) {
    state.household.members = [{ id: "m1", name: "You" }];
  }
  state.onboardingStep = "dietary";
  saveState(state);
  return state;
}

export function setConstraints(raw) {
  const state = loadState();
  if (!state.household) return state;
  state.household.constraints = normalizeConstraints(raw);
  state.onboardingStep = "taste";
  saveState(state);
  return state;
}

export function setTaste(taste) {
  const state = loadState();
  if (!state.household) return state;
  state.household.taste = { ...state.household.taste, ...taste };
  state.onboardingStep = "invite";
  saveState(state);
  return state;
}

export function completeOnboarding() {
  const state = loadState();
  state.onboardingStep = "ready";
  saveState(state);
  track("onboard_complete", {
    householdId: state.household?.id,
    synthetic: !!state.household?.synthetic,
  });
  return state;
}

export function enterAppAfterOnboarding() {
  const state = loadState();
  state.onboarded = true;
  saveState(state);
  return state;
}

export function requestPlans(count = 1) {
  const state = loadState();
  const hh = state.household;
  if (!hh) return state;

  const recentMealIds = state.plans
    .flatMap((p) => p.options.map((o) => o.mealId))
    .slice(-9);

  for (let i = 0; i < count; i++) {
    const planIndex = state.plans.length + 1;
    const options = generatePlanOptions({
      householdId: hh.id,
      planIndex,
      taste: hh.taste,
      constraints: hh.constraints,
      recentMealIds,
    });
    const plan = {
      id: newPlanId(hh.id, planIndex),
      status: "unselected",
      createdAt: new Date().toISOString(),
      options,
      selectedOptionLetter: null,
      cookedAt: null,
      ratings: {},
      feedback: "",
    };
    state.plans.unshift(plan);
    if (!state.activePlanId) state.activePlanId = plan.id;
    track("plan_viewed", { planId: plan.id, optionCount: options.length });
  }
  saveState(state);
  return state;
}

export function getActivePlan(state) {
  if (!state.activePlanId) return state.plans[0] || null;
  return state.plans.find((p) => p.id === state.activePlanId) || state.plans[0] || null;
}

export function selectOption(planId, letter) {
  const state = loadState();
  const plan = state.plans.find((p) => p.id === planId);
  if (!plan) return state;
  plan.status = "selected";
  plan.selectedOptionLetter = letter;
  saveState(state);
  track("selected", { planId, letter });
  return state;
}

export function markCooked(planId) {
  const state = loadState();
  const plan = state.plans.find((p) => p.id === planId);
  if (!plan) return state;
  plan.status = "cooked";
  plan.cookedAt = new Date().toISOString();
  saveState(state);
  track("cooked", { planId });
  return state;
}

export function submitRatings(planId, ratings, feedback = "") {
  const state = loadState();
  const plan = state.plans.find((p) => p.id === planId);
  if (!plan || !state.household) return state;

  plan.ratings = ratings;
  plan.feedback = feedback;
  plan.status = "rated";
  state.activePlanId = null;

  const opt = plan.options.find((o) => o.letter === plan.selectedOptionLetter);
  const signal = {
    mealId: opt?.mealId,
    title: opt?.meal?.title,
    ratings,
    feedback,
    ts: new Date().toISOString(),
  };
  state.tasteModel.signals.unshift(signal);
  state.tasteModel.lastUpdated = new Date().toISOString();
  state.tasteModel.version += 1;

  saveState(state);
  track("rated", { planId, ratings });
  trackBloom("loop_completed", {
    planId,
    ratings,
    mealId: opt?.mealId,
    attribution: attributionPayload(state.attribution),
  });
  return state;
}

export function recordInviteShare(action = "link_copied") {
  const state = loadState();
  if (!state.attribution.inviteToken && state.household?.id) {
    state.attribution.inviteToken = mintInviteToken(state.household.id);
  }
  saveState(state);
  trackBloom("HE-INV", {
    action,
    token: state.attribution.inviteToken,
    attribution: attributionPayload(state.attribution),
  });
  return state;
}

export function recordChoiceSetShare(planId) {
  const state = loadState();
  const token = mintShareToken(planId);
  state.attribution.lastShareToken = token;
  saveState(state);
  trackBloom("HE-SHARE", {
    action: "choice_set_shared",
    token,
    planId,
    attribution: attributionPayload(state.attribution),
  });
  return { state, token };
}

export function setScreenStep(step) {
  const state = loadState();
  state.onboardingStep = step;
  saveState(state);
  return state;
}
