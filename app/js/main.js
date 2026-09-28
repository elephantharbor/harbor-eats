import { track } from "./analytics.js";
import { renderScreen } from "./views.js";
import {
  loadState,
  saveState,
  resetState,
  seedSyntheticHousehold,
  initHousehold,
  setMembers,
  setConstraints,
  setTaste,
  completeOnboarding,
  enterAppAfterOnboarding,
  requestPlans,
  selectOption,
  markCooked,
  submitRatings,
  setScreenStep,
} from "./store.js";

const app = document.getElementById("app");

/** @type {{ name: string, planId?: string }} */
let route = { name: "home" };

/** @type {Record<string, number>} */
let pendingRatings = {};

function parseRoute() {
  const h = (location.hash || "#/home").replace(/^#/, "");
  const parts = h.split("/").filter(Boolean);
  if (!parts.length) return { name: "home" };
  const [name, planId] = parts;
  return { name, planId };
}

function navigate(r) {
  route = r;
  if (state.onboarded) {
    const hash = r.planId ? `#/${r.name}/${r.planId}` : `#/${r.name}`;
    try {
      history.replaceState(null, "", hash);
    } catch (_) {}
  }
  paint();
}

let state = loadState();

function showToast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function paint() {
  app.innerHTML = renderScreen(state, route);
  bind();
}

function bind() {
  app.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", onAction);
  });
  app.querySelectorAll("#cook-steps li").forEach((li) => {
    li.addEventListener("click", () => li.classList.toggle("done"));
  });
}

function readMembersFromDom() {
  const inputs = app.querySelectorAll("[data-member-index]");
  return Array.from(inputs).map((inp, i) => ({
    id: `m${i + 1}`,
    name: inp.value,
  }));
}

function onAction(e) {
  const el = e.currentTarget;
  const action = el.dataset.action;

  switch (action) {
    case "start-onboard":
      state = setScreenStep("household");
      paint();
      break;
    case "load-syn":
      state = seedSyntheticHousehold();
      state = requestPlans(1);
      {
        const plan = state.plans[0];
        if (plan) navigate({ name: "plan", planId: plan.id });
        else navigate({ name: "home" });
      }
      showToast("SYN demo loaded — pick a meal");
      break;
    case "save-household": {
      const name = app.querySelector("#hh-name")?.value || "Our household";
      state = initHousehold(name);
      paint();
      break;
    }
    case "add-member": {
      const wrap = app.querySelector("#member-fields");
      const n = wrap.querySelectorAll("input").length;
      const div = document.createElement("div");
      div.className = "member-row";
      div.innerHTML = `<input type="text" data-member-index="${n}" placeholder="Member ${n + 1}" />`;
      wrap.appendChild(div);
      break;
    }
    case "save-members":
      state = setMembers(readMembersFromDom());
      paint();
      break;
    case "save-dietary": {
      const boxes = app.querySelectorAll('input[name="constraint"]:checked');
      const raw = { cashews_ok: app.querySelector("#cashews-ok")?.checked !== false };
      boxes.forEach((b) => {
        raw[b.value] = true;
      });
      state = setConstraints(raw);
      paint();
      break;
    }
    case "save-taste": {
      const likes = Array.from(app.querySelectorAll('input[name="like"]:checked')).map((x) => x.value);
      const spice = app.querySelector('input[name="spice"]:checked')?.value || "medium";
      const protein = app.querySelector('input[name="protein"]:checked')?.value || "any";
      const time = app.querySelector('input[name="time"]:checked')?.value || "any";
      state = setTaste({ likes, spice, protein, time });
      paint();
      break;
    }
    case "copy-invite":
      showToast("Invite stub copied (preview)");
      break;
    case "skip-invite":
    case "finish-onboard":
      state = completeOnboarding();
      paint();
      break;
    case "first-plans":
      state = enterAppAfterOnboarding();
      state = requestPlans(1);
      {
        const plan = state.plans[0];
        if (plan) navigate({ name: "plan", planId: plan.id });
        else navigate({ name: "home" });
      }
      break;
    case "request-plans":
      state = requestPlans(1);
      {
        const plan = state.plans[0];
        if (plan) navigate({ name: "plan", planId: plan.id });
        else paint();
      }
      break;
    case "open-plan":
      navigate({ name: "plan", planId: el.dataset.planId });
      break;
    case "pick-option":
      state = selectOption(el.dataset.planId, el.dataset.letter);
      navigate({ name: "recipe", planId: el.dataset.planId });
      break;
    case "start-cook":
      navigate({ name: "cook", planId: el.dataset.planId });
      break;
    case "mark-cooked":
      state = markCooked(el.dataset.planId);
      pendingRatings = {};
      navigate({ name: "rate", planId: el.dataset.planId });
      break;
    case "set-rating": {
      const memberId = el.dataset.memberId;
      const value = Number(el.dataset.value);
      pendingRatings[memberId] = value;
      el.closest(".rating-scale")?.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("selected", Number(b.dataset.value) === value);
      });
      const hint = el.closest(".rating-block")?.querySelector(".rating-value");
      if (hint) hint.textContent = `Score: ${value}/10`;
      break;
    }
    case "submit-ratings": {
      const planId = el.dataset.planId;
      const members = state.household?.members || [];
      const ratings = {};
      let ok = true;
      for (const m of members) {
        const v = pendingRatings[m.id];
        if (!v || v < 1 || v > 10) {
          ok = false;
          break;
        }
        ratings[m.id] = v;
      }
      if (!ok) {
        showToast("Each member needs a 1–10 rating");
        return;
      }
      const feedback = app.querySelector("#feedback")?.value || "";
      state = submitRatings(planId, ratings, feedback);
      pendingRatings = {};
      navigate({ name: "taste-updated" });
      break;
    }
    case "go-home":
      navigate({ name: "home" });
      break;
    case "reset-app":
      if (confirm("Clear this device’s Harbor Eats data?")) {
        state = resetState();
        route = { name: "home" };
        location.hash = "";
        paint();
      }
      break;
    case "back":
      if (route.name === "plan") navigate({ name: "home" });
      else if (route.name === "recipe") navigate({ name: "plan", planId: route.planId });
      else if (route.name === "cook") navigate({ name: "recipe", planId: route.planId });
      else if (route.name === "rate") navigate({ name: "cook", planId: route.planId });
      else navigate({ name: "home" });
      break;
    default:
      break;
  }
}

window.addEventListener("hashchange", () => {
  if (!state.onboarded) return;
  route = parseRoute();
  paint();
});

track("app_boot", { path: location.pathname });
if (state.onboarded) {
  route = parseRoute();
} else {
  route = { name: "onboarding" };
}
paint();
