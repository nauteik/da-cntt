-- Migration: Add GPS validation fields to daily_note table
-- Purpose: Track check-in/check-out locations with GPS validation for 1km radius
-- Date: 2025-11-01

-- Add GPS coordinates for check-in
ALTER TABLE daily_note 
ADD COLUMN IF NOT EXISTS check_in_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_in_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_in_distance_meters DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_in_valid BOOLEAN;

-- Add GPS coordinates for check-out
ALTER TABLE daily_note
ADD COLUMN IF NOT EXISTS check_out_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_out_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_out_distance_meters DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS check_out_valid BOOLEAN;

-- Add total hours calculated from check-in to check-out
ALTER TABLE daily_note
ADD COLUMN IF NOT EXISTS total_hours DOUBLE PRECISION;

-- Add comments for new columns
COMMENT ON COLUMN daily_note.check_in_latitude IS 'Latitude of check-in location';
COMMENT ON COLUMN daily_note.check_in_longitude IS 'Longitude of check-in location';
COMMENT ON COLUMN daily_note.check_in_distance_meters IS 'Distance from patient address to check-in location in meters';
COMMENT ON COLUMN daily_note.check_in_valid IS 'Whether check-in is within 1km radius of patient address';

COMMENT ON COLUMN daily_note.check_out_latitude IS 'Latitude of check-out location';
COMMENT ON COLUMN daily_note.check_out_longitude IS 'Longitude of check-out location';
COMMENT ON COLUMN daily_note.check_out_distance_meters IS 'Distance from patient address to check-out location in meters';
COMMENT ON COLUMN daily_note.check_out_valid IS 'Whether check-out is within 1km radius of patient address';

COMMENT ON COLUMN daily_note.total_hours IS 'Total hours worked (calculated from check-in to check-out)';

-- Add constraints for valid coordinates
ALTER TABLE daily_note
ADD CONSTRAINT check_in_latitude_range 
    CHECK (check_in_latitude IS NULL OR (check_in_latitude >= -90 AND check_in_latitude <= 90));

ALTER TABLE daily_note
ADD CONSTRAINT check_in_longitude_range 
    CHECK (check_in_longitude IS NULL OR (check_in_longitude >= -180 AND check_in_longitude <= 180));

ALTER TABLE daily_note
ADD CONSTRAINT check_out_latitude_range 
    CHECK (check_out_latitude IS NULL OR (check_out_latitude >= -90 AND check_out_latitude <= 90));

ALTER TABLE daily_note
ADD CONSTRAINT check_out_longitude_range 
    CHECK (check_out_longitude IS NULL OR (check_out_longitude >= -180 AND check_out_longitude <= 180));

-- Add constraint to ensure check-out time is after check-in time
ALTER TABLE daily_note
ADD CONSTRAINT check_out_after_check_in 
    CHECK (check_out_time IS NULL OR check_in_time IS NULL OR check_out_time >= check_in_time);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_daily_note_check_in_time ON daily_note(check_in_time);
CREATE INDEX IF NOT EXISTS idx_daily_note_check_out_time ON daily_note(check_out_time);
CREATE INDEX IF NOT EXISTS idx_daily_note_check_in_valid ON daily_note(check_in_valid) WHERE check_in_valid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_note_check_out_valid ON daily_note(check_out_valid) WHERE check_out_valid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_note_incomplete_checkout ON daily_note(check_in_time) WHERE check_out_time IS NULL;

-- Create composite index for staff and date range queries
CREATE INDEX IF NOT EXISTS idx_daily_note_staff_checkin_time ON daily_note(staff_id, check_in_time);

COMMENT ON INDEX idx_daily_note_check_in_time IS 'Index for querying daily notes by check-in time';
COMMENT ON INDEX idx_daily_note_check_out_time IS 'Index for querying daily notes by check-out time';
COMMENT ON INDEX idx_daily_note_check_in_valid IS 'Partial index for invalid check-ins (outside 1km)';
COMMENT ON INDEX idx_daily_note_check_out_valid IS 'Partial index for invalid check-outs (outside 1km)';
COMMENT ON INDEX idx_daily_note_incomplete_checkout IS 'Partial index for incomplete check-outs';
COMMENT ON INDEX idx_daily_note_staff_checkin_time IS 'Composite index for staff work history queries';
