USE smart_lost_found;

-- Run this migration ONCE if your found_items CHECK constraint is still
-- found_items_chk_1 and currently allows UNCLAIMED, CLAIMED, RETURNED, COLLECTED.
-- It preserves the existing statuses and adds UNDER_REVIEW.
ALTER TABLE found_items DROP CHECK found_items_chk_1;

ALTER TABLE found_items
ADD CONSTRAINT found_items_chk_1
CHECK (status IN ('UNCLAIMED', 'CLAIMED', 'RETURNED', 'COLLECTED', 'UNDER_REVIEW'));
