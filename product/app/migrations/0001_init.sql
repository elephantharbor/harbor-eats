-- Harbor Eats D1 v0 (skeleton)
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  synthetic INTEGER NOT NULL DEFAULT 0,
  constraints_json TEXT NOT NULL DEFAULT '{}',
  taste_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id),
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  selected_option TEXT,
  cooked_at TEXT
);

CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  member_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  feedback TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attribution_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id TEXT,
  event TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
