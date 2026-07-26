CREATE TABLE product_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL CHECK (length(session_id) = 36),
  name TEXT NOT NULL CHECK (
    name IN (
      'visited',
      'configured',
      'searched',
      'saved',
      'shared',
      'exported',
      'returned'
    )
  ),
  mode TEXT NOT NULL CHECK (mode IN ('all', 'posts', 'reels', 'tags')),
  occurred_on TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (session_id, name, occurred_on)
);

CREATE INDEX product_events_name_created_at
  ON product_events (name, created_at);

CREATE INDEX product_events_session_name
  ON product_events (session_id, name);
