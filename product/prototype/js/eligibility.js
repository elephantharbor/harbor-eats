/**
 * Deterministic eligibility gate — rejects meals violating hard constraints.
 * Rules: dairy, shellfish, meat≠fish, poultry, nuts (except cashew).
 */

const CONSTRAINT_KEYS = [
  "dairy",
  "shellfish",
  "meat_non_fish",
  "poultry",
  "other_nuts",
];

export function normalizeConstraints(raw = {}) {
  return {
    dairy: !!raw.dairy,
    shellfish: !!raw.shellfish,
    meat_non_fish: !!raw.meat_non_fish,
    poultry: !!raw.poultry,
    other_nuts: !!raw.other_nuts,
    cashews_ok: raw.cashews_ok !== false,
  };
}

/** @returns {{ ok: boolean, reasons: string[] }} */
export function checkMealEligibility(meal, constraints) {
  const c = normalizeConstraints(constraints);
  const flags = meal.dietFlags || {};
  const reasons = [];

  if (c.dairy && flags.contains_dairy) {
    reasons.push("Contains dairy (household prohibits)");
  }
  if (c.shellfish && flags.contains_shellfish) {
    reasons.push("Contains shellfish");
  }
  if (c.meat_non_fish && flags.contains_meat_non_fish) {
    reasons.push("Contains meat other than fish");
  }
  if (c.poultry && flags.contains_poultry) {
    reasons.push("Contains poultry");
  }
  if (c.other_nuts && flags.contains_nuts && !flags.cashews_only) {
    reasons.push("Contains nuts (cashews are the only exception)");
  }
  if (c.other_nuts && flags.contains_nuts && flags.cashews_only && !c.cashews_ok) {
    reasons.push("Contains cashews (not permitted for this household)");
  }

  return { ok: reasons.length === 0, reasons };
}

export function filterEligibleMeals(meals, constraints) {
  return meals.filter((m) => checkMealEligibility(m, constraints).ok);
}

export function constraintLabels() {
  return {
    dairy: "No dairy",
    shellfish: "No shellfish",
    meat_non_fish: "No meat (fish OK)",
    poultry: "No poultry",
    other_nuts: "No nuts (cashews OK)",
  };
}
