USE smart_lost_found;

-- Ensure found-item lifecycle statuses can include UNCLAIMED, CLAIMED and COLLECTED.
-- Existing status values are preserved.
ALTER TABLE found_items
MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'UNCLAIMED';
