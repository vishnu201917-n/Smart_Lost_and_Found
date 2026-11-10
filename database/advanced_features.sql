USE smart_lost_found;

-- 1. INDEXES
CREATE INDEX idx_lost_category_status ON lost_items(category, status);
CREATE INDEX idx_found_category_status ON found_items(category, status);

-- 2. VIEW: useful for displaying match information
DROP VIEW IF EXISTS vw_match_details;
CREATE VIEW vw_match_details AS
SELECT m.match_id, m.similarity_score, m.match_status, m.created_at,
       l.item_name AS lost_item, f.item_name AS found_item,
       lu.name AS lost_reporter, fu.name AS found_reporter
FROM matches m
JOIN lost_items l ON m.lost_id = l.lost_id
JOIN found_items f ON m.found_id = f.found_id
JOIN users lu ON l.user_id = lu.user_id
JOIN users fu ON f.user_id = fu.user_id;

-- 3. STORED PROCEDURE: approve/reject a claim
DROP PROCEDURE IF EXISTS ProcessClaim;
DELIMITER //
CREATE PROCEDURE ProcessClaim(IN p_claim_id INT, IN p_status VARCHAR(20))
BEGIN
    UPDATE claims
    SET status = p_status
    WHERE claim_id = p_claim_id;
END //
DELIMITER ;

-- 4. TRIGGER: notify the owner when a new match is created
DROP TRIGGER IF EXISTS after_match_created;
DELIMITER //
CREATE TRIGGER after_match_created
AFTER INSERT ON matches
FOR EACH ROW
BEGIN
    DECLARE owner_id INT;
    DECLARE lost_name VARCHAR(100);

    SELECT user_id, item_name INTO owner_id, lost_name
    FROM lost_items
    WHERE lost_id = NEW.lost_id;

    INSERT INTO notifications (user_id, message)
    VALUES (owner_id, CONCAT('A possible match was found for your lost item: ', lost_name));
END //
DELIMITER ;
