/** Bloom PLG attribution tokens (HE-INV / HE-SHARE). */

export const PUBLIC_PROTOTYPE_BASE =
  "https://elephantharbor.github.io/harbor-eats-app/";

export function parseAttributionFromLocation(search = "") {
  const p = new URLSearchParams(search || "");
  return {
    heInv: p.get("HE-INV") || p.get("he-inv") || null,
    heShare: p.get("HE-SHARE") || p.get("he-share") || null,
  };
}

export function mintInviteToken(householdId) {
  const slug = String(householdId || "hh")
    .replace(/[^A-Za-z0-9-]/g, "")
    .slice(0, 24);
  return `HE-INV-${slug}-${Date.now().toString(36).slice(-5)}`;
}

export function mintShareToken(planId) {
  const slug = String(planId || "plan").replace(/[^A-Za-z0-9-]/g, "");
  return `HE-SHARE-${slug}`;
}

export function inviteUrl(inviteToken) {
  const u = new URL(PUBLIC_PROTOTYPE_BASE);
  u.searchParams.set("HE-INV", inviteToken);
  return u.toString();
}

export function shareChoiceSetUrl(shareToken) {
  const u = new URL(PUBLIC_PROTOTYPE_BASE);
  u.searchParams.set("HE-SHARE", shareToken);
  return u.toString();
}
