WITH session_funnel AS (
  SELECT
    session_id,
    MAX(name = 'visited') AS visited,
    MAX(name = 'configured') AS configured,
    MAX(name = 'searched') AS searched,
    MAX(name = 'saved') AS saved,
    MAX(name = 'shared') AS shared,
    MAX(name = 'exported') AS exported
  FROM product_events
  GROUP BY session_id
)
SELECT
  COALESCE(SUM(visited), 0) AS users,
  COALESCE(SUM(configured), 0) AS configured,
  COALESCE(SUM(searched), 0) AS searched,
  COALESCE(SUM(saved), 0) AS saved,
  COALESCE(SUM(shared), 0) AS shared,
  COALESCE(SUM(exported), 0) AS exported,
  (
    SELECT COUNT(*)
    FROM (
      SELECT session_id
      FROM product_events
      WHERE name = 'searched'
      GROUP BY session_id
      HAVING COUNT(DISTINCT occurred_on) >= 2
    )
  ) AS returned,
  (
    SELECT COUNT(DISTINCT session_id)
    FROM product_events
    WHERE name = 'visited'
      AND created_at >= unixepoch() - 604800
  ) AS users_7d,
  (
    SELECT COUNT(DISTINCT session_id)
    FROM product_events
    WHERE name = 'searched'
      AND created_at >= unixepoch() - 604800
  ) AS searches_7d
FROM session_funnel;
