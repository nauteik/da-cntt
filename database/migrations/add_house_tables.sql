-- Migration: Add house and patient_house_stay tables
-- Created for Housing Menu Implementation



-- Create indexes for patient_house_stay table
CREATE INDEX idx_patient_house_stay_patient ON patient_house_stay (patient_id);
CREATE INDEX idx_patient_house_stay_house ON patient_house_stay (house_id);
CREATE INDEX idx_patient_house_stay_move_in_date ON patient_house_stay (move_in_date DESC);
CREATE INDEX idx_patient_house_stay_active ON patient_house_stay (patient_id, house_id) WHERE move_out_date IS NULL;
CREATE INDEX idx_patient_house_stay_house_active ON patient_house_stay (house_id) WHERE move_out_date IS NULL;

-- Add comment to tables
COMMENT ON TABLE house IS 'Residential housing units for patients with residential care setting';
COMMENT ON TABLE patient_house_stay IS 'Tracks patient residence history in houses. move_out_date IS NULL means patient is currently staying.';

-- Add comments to key columns
COMMENT ON COLUMN patient_house_stay.move_in_date IS 'Date when patient moved into the house';
COMMENT ON COLUMN patient_house_stay.move_out_date IS 'Date when patient moved out. NULL means patient is currently staying.';





