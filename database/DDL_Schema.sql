CREATE DATABASE IF NOT EXISTS smart_lost_found
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE smart_lost_found;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY email (email),
    CONSTRAINT users_chk_1
        CHECK (role IN ('STUDENT', 'ADMIN'))
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 2. LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
    location_id INT NOT NULL AUTO_INCREMENT,
    location_name VARCHAR(100) NOT NULL,
    description TEXT,
    PRIMARY KEY (location_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 3. LOST_ITEMS
CREATE TABLE IF NOT EXISTS lost_items (
    lost_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(50) DEFAULT NULL,
    brand VARCHAR(100) DEFAULT NULL,
    description TEXT,
    date_lost DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    PRIMARY KEY (lost_id),
    KEY user_id (user_id),
    KEY location_id (location_id),
    KEY idx_lost_category_status (category, status),
    CONSTRAINT lost_items_ibfk_1
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT lost_items_ibfk_2
        FOREIGN KEY (location_id) REFERENCES locations (location_id),
    CONSTRAINT lost_items_chk_1
        CHECK (status IN ('OPEN', 'MATCHED', 'RETURNED'))
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 4. FOUND_ITEMS
CREATE TABLE IF NOT EXISTS found_items (
    found_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(50) DEFAULT NULL,
    brand VARCHAR(100) DEFAULT NULL,
    description TEXT,
    date_found DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNCLAIMED',
    PRIMARY KEY (found_id),
    KEY user_id (user_id),
    KEY location_id (location_id),
    KEY idx_found_category_status (category, status),
    CONSTRAINT found_items_ibfk_1
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT found_items_ibfk_2
        FOREIGN KEY (location_id) REFERENCES locations (location_id),
    CONSTRAINT found_items_chk_1
        CHECK (
            status IN (
                'UNCLAIMED',
                'CLAIMED',
                'RETURNED',
                'COLLECTED',
                'UNDER_REVIEW'
            )
        )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 5. MATCHES
CREATE TABLE IF NOT EXISTS matches (
    match_id INT NOT NULL AUTO_INCREMENT,
    lost_id INT NOT NULL,
    found_id INT NOT NULL,
    similarity_score DECIMAL(5,4) DEFAULT NULL,
    match_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (match_id),
    KEY lost_id (lost_id),
    KEY found_id (found_id),
    CONSTRAINT matches_ibfk_1
        FOREIGN KEY (lost_id) REFERENCES lost_items (lost_id),
    CONSTRAINT matches_ibfk_2
        FOREIGN KEY (found_id) REFERENCES found_items (found_id),
    CONSTRAINT matches_chk_1
        CHECK (similarity_score >= 0 AND similarity_score <= 1),
    CONSTRAINT matches_chk_2
        CHECK (match_status IN ('PENDING', 'CONFIRMED', 'REJECTED'))
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 6. CLAIMS
CREATE TABLE IF NOT EXISTS claims (
    claim_id INT NOT NULL AUTO_INCREMENT,
    match_id INT NOT NULL,
    user_id INT NOT NULL,
    proof_description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (claim_id),
    KEY match_id (match_id),
    KEY user_id (user_id),
    CONSTRAINT claims_ibfk_1
        FOREIGN KEY (match_id) REFERENCES matches (match_id),
    CONSTRAINT claims_ibfk_2
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT claims_chk_1
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT '0',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id),
    KEY user_id (user_id),
    CONSTRAINT notifications_ibfk_1
        FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 8. REPORTS
CREATE TABLE IF NOT EXISTS reports (
    report_id INT NOT NULL AUTO_INCREMENT,
    found_id INT NOT NULL,
    reported_by INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_comment TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (report_id),
    KEY found_id (found_id),
    KEY reported_by (reported_by),
    CONSTRAINT reports_ibfk_1
        FOREIGN KEY (found_id) REFERENCES found_items (found_id),
    CONSTRAINT reports_ibfk_2
        FOREIGN KEY (reported_by) REFERENCES users (user_id),
    CONSTRAINT reports_chk_1
        CHECK (
            status IN (
                'PENDING',
                'REVIEWED',
                'RESOLVED',
                'APPROVED',
                'REJECTED'
            )
        )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

