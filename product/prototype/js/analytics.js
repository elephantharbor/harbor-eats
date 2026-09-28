/** Product + Bloom instrumentation (console + local event log). */
const EVENT_LOG_KEY = "he-product-analytics";

export function track(event, props = {}) {
  const row = {
    event,
    props,
    ts: new Date().toISOString(),
  };
  console.info("[Harbor Eats]", event, props);
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(row);
    if (list.length > 300) list.splice(0, list.length - 300);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(list));
  } catch (_) {
    /* ignore quota */
  }
  return row;
}

/** Bloom attribution surface — HE-INV, HE-SHARE, loop_completed. */
export function trackBloom(event, props = {}) {
  return track(event, { ...props, surface: "bloom" });
}

export function getEventLog() {
  try {
    return JSON.parse(localStorage.getItem(EVENT_LOG_KEY) || "[]");
  } catch (_) {
    return [];
  }
}

export function attributionPayload(attribution) {
  if (!attribution) return {};
  return {
    heInv: attribution.heInv || attribution.inboundHeInv || null,
    heShare: attribution.heShare || attribution.inboundHeShare || null,
    inviteToken: attribution.inviteToken || null,
    lastShareToken: attribution.lastShareToken || null,
  };
}
