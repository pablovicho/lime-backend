-- Seed fake patients into the database

INSERT INTO patients (
  first_name, 
  last_name, 
  date_of_birth, 
  gender, 
  phone_number, 
  email, 
  address_street, 
  address_city, 
  address_state, 
  address_zip_code, 
  medical_record_number
) VALUES 
(
  'Robert',
  'Johnson',
  '1975-03-15',
  'male',
  '555-0101',
  'robert.johnson@email.com',
  '123 Maple Street',
  'Chicago',
  'IL',
  '60601',
  'MRN001234'
),
(
  'Maria',
  'Garcia',
  '1988-07-22',
  'female',
  '555-0202',
  'maria.garcia@email.com',
  '456 Oak Avenue',
  'Springfield',
  'IL',
  '62701',
  'MRN002345'
),
(
  'James',
  'Williams',
  '1962-11-08',
  'male',
  '555-0303',
  'james.williams@email.com',
  '789 Pine Road',
  'Peoria',
  'IL',
  '61602',
  'MRN003456'
);

-- Display the inserted patients
SELECT 
  id,
  first_name,
  last_name,
  date_of_birth,
  medical_record_number,
  created_at
FROM patients
ORDER BY created_at DESC
LIMIT 3;
