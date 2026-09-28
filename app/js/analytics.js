/** Basic event instrumentation — console + in-memory log for demo. */
const EVENT_LOG_KEY = "he-consumer-analytics";

export function track(event, props = {}) {
  const row = {
    event,
    props,
    ts: new Date().toISOString(),
  };
  console.info("[Harbor Eats analytics]", event, props);
  try {
    const raw = localStorage.getItem(EVENT_LOG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(row);
    if (list.length > 200) list.splice(0, list.length - 200);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(list));
  } catch (_) {
    /* ignore quota */
  }
  return row;
}

export function getEventLog() {
  try {
    return JSON.parse(localStorage.getItem(EVENT_LOG_KEY) || "[]");
  } catch (_) {
    return [];
  }
}
