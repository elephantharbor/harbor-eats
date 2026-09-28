import { ONBOARDING_STEPS, getActivePlan } from "./store.js";
import { constraintLabels } from "./eligibility.js";
import { inviteUrl } from "./attribution.js";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function header(state, { back, title } = {}) {
  const hh = state?.household;
  const syn = hh?.synthetic
    ? `<span class="badge badge-syn">Synthetic demo</span>`
    : "";
  return `
    <header class="app-header">
      <div class="brand-lockup">
        ${back ? `<button type="button" class="btn-ghost" data-action="back" aria-label="Back">←</button>` : `<div class="brand-mark" aria-hidden="true">HE</div>`}
        <div>
          <h1 class="brand-title">${esc(title || "Harbor Eats")}</h1>
          ${hh ? `<p class="brand-tag">${esc(hh.name)} ${syn}</p>` : `<p class="brand-tag">Meals that fit your household</p>`}
        </div>
      </div>
    </header>`;
}

function progress(step) {
  const idx = ONBOARDING_STEPS.indexOf(step);
  if (idx < 0) return "";
  return `<div class="progress-dots" aria-hidden="true">${ONBOARDING_STEPS.map((s, i) => {
    let cls = "";
    if (i < idx) cls = "done";
    if (i === idx) cls = "active";
    return `<span class="${cls}"></span>`;
  }).join("")}</div>`;
}

function footerNote() {
  return `<footer class="app-footer">Harbor Eats product prototype · Not the Operating Desk</footer>`;
}

export function renderWelcome() {
  return `
    ${header(null, { title: "Harbor Eats" })}
    <main class="app-main">
      <div class="hero-art" role="img" aria-label="Harbor brand gradient"></div>
      <h2 class="display">Dinner, decided together</h2>
      <p class="lead">Three tailored options, cook mode, and ratings that sharpen your household taste model — in a few taps, not a survey.</p>
      <div class="card" style="margin-bottom:16px;border-color:var(--signal-brass)">
        <p class="section-label">PLG · Demo card (S3)</p>
        <h2 class="card-title">SYN walkthrough</h2>
        <p class="card-meta">Household <code>SYN-DEMO-001</code> · dual 1–10 ratings · loop in ~2 min</p>
        <button type="button" class="btn btn-accent" style="width:100%;margin-top:12px" data-action="load-syn">Start SYN demo</button>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="start-onboard">Get started</button>
      </div>
      <p class="card-meta" style="margin-top:16px">SYN-* households are labeled synthetic demo data, never real HH001 evidence.</p>
    </main>
    ${footerNote()}
  `;
}

export function renderHouseholdForm(state) {
  return `
    ${header(state, { title: "Your household" })}
    <main class="app-main">
      ${progress(state.onboardingStep)}
      <p class="section-label">Step 1 of 5</p>
      <h2 class="display">Name your kitchen</h2>
      <p class="lead">This is how we’ll greet you — e.g. “Renata & Tom” or “Lake House”.</p>
      <div class="field">
        <label for="hh-name">Household name</label>
        <input id="hh-name" type="text" placeholder="Our household" autocomplete="organization" />
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="save-household">Continue</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderMembersForm(state) {
  const members = state.household?.members?.length
    ? state.household.members
    : [{ id: "m1", name: "" }, { id: "m2", name: "" }];
  const rows = members
    .map(
      (m, i) => `<div class="member-row">
        <input type="text" data-member-index="${i}" placeholder="${i === 0 ? "You" : "Partner or roommate"}" value="${esc(m.name)}" />
      </div>`
    )
    .join("");
  return `
    ${header(state, { title: "Members" })}
    <main class="app-main">
      ${progress(state.onboardingStep)}
      <p class="section-label">Step 2 of 5</p>
      <h2 class="display">Who’s eating?</h2>
      <p class="lead">Everyone who rates meals gets their own 1–10 score later.</p>
      <div id="member-fields">${rows}</div>
      <button type="button" class="link-btn" data-action="add-member">+ Add another member</button>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="save-members">Continue</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderDietaryForm(state) {
  const c = state.household?.constraints || {};
  const labels = constraintLabels();
  const keys = Object.keys(labels);
  const chips = keys
    .map(
      (k) => `<label class="chip"><input type="checkbox" name="constraint" value="${k}" ${c[k] ? "checked" : ""} /> ${esc(labels[k])}</label>`
    )
    .join("");
  return `
    ${header(state, { title: "Hard locks" })}
    <main class="app-main">
      ${progress(state.onboardingStep)}
      <p class="section-label">Step 3 of 5</p>
      <h2 class="display">Non‑negotiables</h2>
      <p class="lead">We never suggest meals that break these rules. Cashews stay allowed when other nuts are off.</p>
      <div class="chip-grid">${chips}</div>
      <div class="field" style="margin-top:16px">
        <label class="chip"><input type="checkbox" id="cashews-ok" ${c.cashews_ok !== false ? "checked" : ""} /> Cashews OK when other nuts are off</label>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="save-dietary">Continue</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderTasteForm(state) {
  const t = state.household?.taste || {};
  const likeOpts = ["bowls", "pasta", "curries", "tacos", "sheet-pan"];
  const likes = likeOpts
    .map(
      (o) => `<label class="chip"><input type="checkbox" name="like" value="${o}" ${(t.likes || []).includes(o) ? "checked" : ""} /> ${esc(o)}</label>`
    )
    .join("");
  return `
    ${header(state, { title: "Quick taste seed" })}
    <main class="app-main">
      ${progress(state.onboardingStep)}
      <p class="section-label">Step 4 of 5</p>
      <h2 class="display">A few taps, not fifty questions</h2>
      <p class="lead">Enough to personalize the first plan. We’ll learn more when you rate meals.</p>
      <p class="section-label">Formats you reach for</p>
      <div class="chip-grid">${likes}</div>
      <p class="section-label" style="margin-top:16px">Spice</p>
      <div class="chip-grid">
        ${["mild", "medium", "bold"].map((s) => `<label class="chip"><input type="radio" name="spice" value="${s}" ${t.spice === s ? "checked" : ""} /> ${s}</label>`).join("")}
      </div>
      <p class="section-label" style="margin-top:16px">Protein vibe</p>
      <div class="chip-grid">
        ${[
          ["plants", "Mostly plants"],
          ["fish", "Fish often"],
          ["any", "Mix it up"],
        ]
          .map(
            ([v, lab]) => `<label class="chip"><input type="radio" name="protein" value="${v}" ${t.protein === v ? "checked" : ""} /> ${lab}</label>`
          )
          .join("")}
      </div>
      <p class="section-label" style="margin-top:16px">Time</p>
      <div class="chip-grid">
        ${[
          ["quick", "≤40 min"],
          ["slow", "OK with longer"],
          ["any", "Flexible"],
        ]
          .map(
            ([v, lab]) => `<label class="chip"><input type="radio" name="time" value="${v}" ${t.time === v ? "checked" : ""} /> ${lab}</label>`
          )
          .join("")}
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="save-taste">Continue</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderInvite(state) {
  const token = state.attribution?.inviteToken || "HE-INV-pending";
  const link = inviteUrl(token);
  return `
    ${header(state, { title: "Invite" })}
    <main class="app-main">
      ${progress(state.onboardingStep)}
      <p class="section-label">PLG · Invite (S1)</p>
      <h2 class="display">Invite others</h2>
      <p class="lead">Share a link so everyone can rate on their phone. Bloom tracks <code>HE-INV</code> through <code>loop_completed</code>.</p>
      <div class="card">
        <p class="card-meta">Invite link</p>
        <p class="card-title" style="font-size:13px;font-family:ui-monospace,monospace;word-break:break-all">${esc(link)}</p>
        <button type="button" class="btn btn-secondary" style="margin-top:12px;width:100%" data-action="copy-invite">Copy invite link</button>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="finish-onboard">See my first meals</button>
        <button type="button" class="btn btn-ghost" data-action="skip-invite">Skip for now</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderReady(state) {
  return `
    ${header(state, { title: "You're set" })}
    <main class="app-main">
      <h2 class="display">First plan, three choices</h2>
      <p class="lead">We’ll generate options that respect your hard locks and taste seed.</p>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="first-plans">Show 3 meal options</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderHome(state) {
  const plan = getActivePlan(state);
  const rated = state.plans.filter((p) => p.status === "rated").length;
  return `
    ${header(state, { title: "Tonight" })}
    <main class="app-main">
      ${state.household?.synthetic ? `<div class="card" style="border-color:var(--signal-brass)"><p class="card-meta"><span class="badge badge-syn">SYN-DEMO-001</span> Walkthrough data only</p></div>` : ""}
      ${
        plan
          ? `<div class="card">
        <span class="badge badge-status">${esc(plan.status)}</span>
        <h2 class="card-title" style="margin-top:8px">${esc(plan.id)}</h2>
        <p class="card-meta">${plan.options.length} options waiting</p>
        <div class="btn-row" style="margin-top:12px">
          <button type="button" class="btn btn-primary" data-action="open-plan" data-plan-id="${esc(plan.id)}">Open plan</button>
        </div>
      </div>`
          : `<div class="empty-state"><p>No active plan</p></div>`
      }
      <div class="card">
        <h2 class="card-title">Taste model</h2>
        <p class="card-meta">Version ${state.tasteModel?.version || 1} · ${rated} rated meals</p>
        <div>${(state.tasteModel?.signals || []).slice(0, 3).map((s) => `<span class="taste-pill">${esc(s.title || "signal")}</span>`).join("") || `<span class="card-meta">Rate a meal to update</span>`}</div>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-secondary" data-action="request-plans">Request another plan</button>
        <button type="button" class="btn btn-ghost" data-action="reset-app">Reset & start over</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderPlanOptions(state, planId) {
  const plan = state.plans.find((p) => p.id === planId);
  if (!plan) return renderHome(state);
  const cards = plan.options
    .map(
      (o) => `<button type="button" class="card card-selectable" data-action="pick-option" data-plan-id="${esc(plan.id)}" data-letter="${esc(o.letter)}">
      <p class="card-meta">Option ${esc(o.letter)} · ${esc(o.meal.cuisine)} · ${esc(o.meal.subtitle)}</p>
      <h2 class="card-title">${esc(o.meal.title)}</h2>
      <p class="card-why">${esc(o.why)}</p>
    </button>`
    )
    .join("");
  return `
    ${header(state, { title: "Pick one", back: true })}
    <main class="app-main">
      <h2 class="display">Three ways to eat well tonight</h2>
      <p class="lead">Each option passed your household eligibility gate.</p>
      <div class="plan-stack">${cards}</div>
      <div class="card" style="margin-top:16px">
        <p class="section-label">PLG · Shareable choice-set (S2)</p>
        <p class="card-meta">Send all three options — attribution via <code>HE-SHARE</code></p>
        <button type="button" class="btn btn-secondary" style="width:100%" data-action="share-choice-set" data-plan-id="${esc(plan.id)}">Copy share link</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderRecipe(state, planId) {
  const plan = state.plans.find((p) => p.id === planId);
  if (!plan || !plan.selectedOptionLetter) return renderPlanOptions(state, planId);
  const opt = plan.options.find((o) => o.letter === plan.selectedOptionLetter);
  const meal = opt?.meal;
  if (!meal) return renderHome(state);
  const ing = meal.ingredients.map((i) => `<li>${esc(i)}</li>`).join("");
  return `
    ${header(state, { title: "Recipe", back: true })}
    <main class="app-main">
      <span class="badge badge-status">Selected · ${esc(opt.letter)}</span>
      <h2 class="display" style="margin-top:8px">${esc(meal.title)}</h2>
      <p class="lead">${esc(meal.subtitle)}</p>
      <div class="card recipe-md">
        <h3>Ingredients</h3>
        <ul>${ing}</ul>
        <h3>Overview</h3>
        <p class="card-meta">${esc(meal.prepMin)} min prep · ${esc(meal.cookMin)} min cook</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="start-cook" data-plan-id="${esc(plan.id)}">Start cook mode</button>
        <button type="button" class="btn btn-secondary" data-action="open-plan" data-plan-id="${esc(plan.id)}">Change selection</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderCookMode(state, planId) {
  const plan = state.plans.find((p) => p.id === planId);
  const opt = plan?.options.find((o) => o.letter === plan.selectedOptionLetter);
  const meal = opt?.meal;
  if (!meal) return renderRecipe(state, planId);
  const steps = meal.steps
    .map((s, i) => `<li data-step="${i}">${esc(s)}</li>`)
    .join("");
  return `
    ${header(state, { title: "Cook mode", back: true })}
    <main class="app-main">
      <h2 class="display">${esc(meal.title)}</h2>
      <p class="lead">Tap steps as you go — keep your phone on the counter.</p>
      <ol class="step-list" id="cook-steps">${steps}</ol>
      <div class="btn-row">
        <button type="button" class="btn btn-accent" data-action="mark-cooked" data-plan-id="${esc(plan.id)}">Mark as cooked</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderRate(state, planId) {
  const plan = state.plans.find((p) => p.id === planId);
  const members = state.household?.members || [{ id: "m1", name: "You" }];
  const blocks = members
    .map((m) => {
      const cur = plan?.ratings?.[m.id];
      const buttons = Array.from({ length: 10 }, (_, i) => {
        const n = i + 1;
        const sel = cur === n ? "selected" : "";
        return `<button type="button" class="${sel}" data-action="set-rating" data-member-id="${esc(m.id)}" data-value="${n}">${n}</button>`;
      }).join("");
      return `<div class="rating-block" data-rating-member="${esc(m.id)}">
        <h3>${esc(m.name)}</h3>
        <div class="rating-scale">${buttons}</div>
        <p class="rating-value">${cur ? `Score: ${cur}/10` : "Tap 1–10"}</p>
      </div>`;
    })
    .join("");
  return `
    ${header(state, { title: "Rate it", back: true })}
    <main class="app-main">
      <h2 class="display">How was it?</h2>
      <p class="lead">Each person rates 1–10. We use this to update your taste model.</p>
      ${blocks}
      <div class="field">
        <label for="feedback">Optional note</label>
        <input id="feedback" type="text" placeholder="Too spicy, loved the crunch…" value="${esc(plan?.feedback || "")}" />
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="submit-ratings" data-plan-id="${esc(plan.id)}">Save ratings</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderTasteUpdated(state) {
  return `
    ${header(state, { title: "Taste model" })}
    <main class="app-main">
      <div class="hero-art" style="height:80px"></div>
      <h2 class="display">Taste model updated</h2>
      <p class="lead">Your household profile is a little sharper. The next plan will weigh today’s scores.</p>
      <div class="card">
        <p class="card-meta">Model version ${state.tasteModel?.version || 1}</p>
        <p class="card-title" style="font-family:var(--font-sans);font-size:15px">${(state.tasteModel?.signals || []).slice(0, 2).map((s) => esc(s.title)).join(" · ") || "First signal recorded"}</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="go-home">Back to home</button>
        <button type="button" class="btn btn-secondary" data-action="request-plans">Plan another meal</button>
      </div>
    </main>
    ${footerNote()}
  `;
}

export function renderScreen(state, route) {
  if (!state.onboarded) {
    switch (state.onboardingStep) {
      case "welcome":
        return renderWelcome();
      case "household":
        return renderHouseholdForm(state);
      case "members":
        return renderMembersForm(state);
      case "dietary":
        return renderDietaryForm(state);
      case "taste":
        return renderTasteForm(state);
      case "invite":
        return renderInvite(state);
      case "ready":
        return renderReady(state);
      default:
        return renderWelcome();
    }
  }

  switch (route.name) {
    case "plan":
      return renderPlanOptions(state, route.planId);
    case "recipe":
      return renderRecipe(state, route.planId);
    case "cook":
      return renderCookMode(state, route.planId);
    case "rate":
      return renderRate(state, route.planId);
    case "taste-updated":
      return renderTasteUpdated(state);
    case "home":
    default:
      return renderHome(state);
  }
}
