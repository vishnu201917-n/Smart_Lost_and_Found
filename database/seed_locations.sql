USE smart_lost_found;

-- Add sample campus locations only when their names do not already exist.
INSERT INTO locations (location_name)
SELECT 'Library'
WHERE NOT EXISTS (
    SELECT 1 FROM locations WHERE location_name = 'Library'
);

INSERT INTO locations (location_name)
SELECT 'Cafeteria'
WHERE NOT EXISTS (
    SELECT 1 FROM locations WHERE location_name = 'Cafeteria'
);

INSERT INTO locations (location_name)
SELECT 'Main Gate'
WHERE NOT EXISTS (
    SELECT 1 FROM locations WHERE location_name = 'Main Gate'
);

INSERT INTO locations (location_name)
SELECT 'Computer Lab'
WHERE NOT EXISTS (
    SELECT 1 FROM locations WHERE location_name = 'Computer Lab'
);

INSERT INTO locations (location_name)
SELECT 'Auditorium'
WHERE NOT EXISTS (
    SELECT 1 FROM locations WHERE location_name = 'Auditorium'
);

INSERT INTO locations (location_name)
SELECT 'Parking Area'
WHERE NOT EXISTS (
    SELECT 1 FROM locations WHERE location_name = 'Parking Area'
);

SELECT location_id, location_name
FROM locations
ORDER BY location_id;
