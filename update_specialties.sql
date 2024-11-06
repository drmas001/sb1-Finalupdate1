-- Add check constraint for specialties in patients table
ALTER TABLE patients DROP CONSTRAINT IF EXISTS check_specialty;
ALTER TABLE patients ADD CONSTRAINT check_specialty 
CHECK (specialty IN (
  'General Internal Medicine',
  'Respiratory Medicine',
  'Infectious Diseases',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Hematology',
  'Thrombosis Medicine',
  'Immunology & Allergy',
  'Safety Admission',
  'Medical Consultations',
  'Endocrinology'
));

-- Add check constraint for specialties in consultations table
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS check_consultation_specialty;
ALTER TABLE consultations ADD CONSTRAINT check_consultation_specialty 
CHECK (consultation_specialty IN (
  'General Internal Medicine',
  'Respiratory Medicine',
  'Infectious Diseases',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Hematology',
  'Thrombosis Medicine',
  'Immunology & Allergy',
  'Safety Admission',
  'Medical Consultations',
  'Endocrinology'
));

-- Add check constraint for specialties in clinic_appointments table
ALTER TABLE clinic_appointments DROP CONSTRAINT IF EXISTS check_clinic_specialty;
ALTER TABLE clinic_appointments ADD CONSTRAINT check_clinic_specialty 
CHECK (clinic_specialty IN (
  'General Internal Medicine',
  'Respiratory Medicine',
  'Infectious Diseases',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Hematology',
  'Thrombosis Medicine',
  'Immunology & Allergy',
  'Safety Admission',
  'Medical Consultations',
  'Endocrinology'
));