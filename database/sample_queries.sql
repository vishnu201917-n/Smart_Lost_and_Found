USE smart_lost_found;

-- Simple query with JOIN
SELECT l.item_name, u.name, lo.location_name
FROM lost_items l
JOIN users u ON l.user_id=u.user_id
JOIN locations lo ON l.location_id=lo.location_id;

-- GROUP BY and aggregate
SELECT category, COUNT(*) AS total_lost
FROM lost_items
GROUP BY category
ORDER BY total_lost DESC;

-- UPDATE
UPDATE notifications SET is_read=1 WHERE notification_id=1;

-- DELETE
DELETE FROM notifications WHERE notification_id=99999;

-- Nested query
SELECT * FROM found_items
WHERE found_id IN (SELECT found_id FROM matches WHERE similarity_score >= 0.80);

-- Correlated query
SELECT l.*
FROM lost_items l
WHERE EXISTS (
  SELECT 1 FROM matches m
  WHERE m.lost_id=l.lost_id
);
