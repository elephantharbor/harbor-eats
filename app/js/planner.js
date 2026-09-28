import { getVisibleMeals } from "./catalog.js";
import { filterEligibleMeals, checkMealEligibility } from "./eligibility.js";

/** Simple deterministic hash for stable plan picks. */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function scoreMeal(meal, taste, memberCount, salt) {
  let score = hashStr(`${meal.id}:${salt}`) % 1000;
  const flavors = meal.flavors || [];
  for (const t of taste.likes || []) {
    if (flavors.some((f) => f.includes(t) || t.includes(f))) score += 80;
    if (meal.cuisine.toLowerCase().includes(t)) score += 60;
    if (meal.format === t) score += 40;
  }
  for (const t of taste.avoids || []) {
    if (flavors.some((f) => f.includes(t))) score -= 100;
  }
  if (taste.spice === "mild" && flavors.includes("spicy")) score -= 50;
  if (taste.spice === "bold" && flavors.includes("mild spice")) score += 20;
  if (taste.protein === "fish" && meal.dietFlags.contains_fish) score += 70;
  if (taste.protein === "plants" && !meal.dietFlags.contains_fish) score += 50;
  if (taste.time === "quick" && meal.prepMin + meal.cookMin <= 40) score += 30;
  if (taste.time === "slow" && meal.prepMin + meal.cookMin >= 40) score += 20;
  void memberCount;
  return score;
}

function whyHere(meal, taste, constraints) {
  const bits = [];
  const likes = taste.likes || [];
  if (likes.includes("bowls") && meal.format === "bowl") {
    bits.push("You said you like bowls");
  }
  if (likes.includes("pasta") && meal.format === "pasta") {
    bits.push("Matches your pasta pick");
  }
  if (likes.includes("curries") && meal.format === "curry") {
    bits.push("Curry-friendly for your household");
  }
  if (taste.protein === "fish" && meal.dietFlags.contains_fish) {
    bits.push("Fish-forward option for tonight");
  }
  if (taste.protein === "plants" && !meal.dietFlags.contains_fish) {
    bits.push("Plant-forward and still satisfying");
  }
  if (taste.time === "quick" && meal.prepMin + meal.cookMin <= 40) {
    bits.push("Fits your quick-weeknight preference");
  }
  if (meal.effort === "easy") {
    bits.push("Easy effort — good for building the habit");
  }
  if (constraints.dairy && !meal.dietFlags.contains_dairy) {
    bits.push("Stays dairy-free for your hard lock");
  }
  if (!bits.length) {
    bits.push("Balanced variety vs your recent picks");
  }
  return bits[0];
}

/**
 * @param {{ householdId: string, planIndex: number, taste: object, constraints: object, recentMealIds: string[] }} opts
 */
export function generatePlanOptions(opts) {
  const { householdId, planIndex, taste, constraints, recentMealIds = [] } = opts;
  const pool = filterEligibleMeals(getVisibleMeals(), constraints);
  const salt = `${householdId}-p${planIndex}`;

  const ranked = pool
    .map((meal) => ({
      meal,
      score: scoreMeal(meal, taste, 2, salt),
      eligible: checkMealEligibility(meal, constraints),
    }))
    .filter((x) => x.eligible.ok)
    .sort((a, b) => b.score - a.score);

  const picked = [];
  for (const row of ranked) {
    if (picked.length >= 3) break;
    if (recentMealIds.includes(row.meal.id)) continue;
    if (picked.some((p) => p.meal.id === row.meal.id)) continue;
    picked.push(row);
  }
  for (const row of ranked) {
    if (picked.length >= 3) break;
    if (picked.some((p) => p.meal.id === row.meal.id)) continue;
    picked.push(row);
  }

  const letters = ["A", "B", "C"];
  return picked.slice(0, 3).map((row, i) => ({
    letter: letters[i],
    mealId: row.meal.id,
    meal: row.meal,
    why: whyHere(row.meal, taste, constraints),
  }));
}

export function newPlanId(householdId, planIndex) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const suffix = householdId.startsWith("SYN-") ? "SYN" : "HH";
  return `HE-${y}-${m}-${day}-${suffix}-P${String(planIndex).padStart(2, "0")}`;
}
