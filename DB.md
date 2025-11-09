# Database Setup Guide

## Prerequisites

- PostgreSQL 12+ installed on your system
- Database credentials with CREATE DATABASE privileges

## Quick Setup

### 1. Install, setup, enable, and start PostgreSQL (if not already installed)

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE lime_scribe;
CREATE USER lime_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lime_scribe TO lime_user;

# Exit PostgreSQL shell
\q
```

### 3. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL=postgresql://lime_user:your_secure_password@localhost:5432/lime_scribe
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lime_scribe
DB_USER=lime_user
DB_PASSWORD=your_secure_password
```

### 4. Run Database Schema

```bash
# Connect to your database
psql -U lime_user -d lime_scribe -h localhost -f db/schema.sql
```

Or using the PostgreSQL client:
```bash
sudo -u postgres psql -d lime_scribe -f db/schema.sql
```

### 5. Verify Connection

Your application will automatically test the connection on startup. You can also manually test:

```bash
psql -U lime_user -d lime_scribe -h localhost -c "SELECT NOW();"
```

### 6. Seed with mock patients

To populate the database with initial test data, run the seed script:

```bash
# Using psql client
psql -U lime_user -d lime_scribe -h localhost -f db/seed.sql
```

Or using the postgres user:
```bash
sudo -u postgres psql -d lime_scribe -f db/seed.sql
```

This will populate your database with:
- Sample patient records
- Example clinical notes
- Test data for development

You can verify the seeding was successful by checking the record count:
```bash
psql -U lime_user -d lime_scribe -h localhost -c "SELECT COUNT(*) FROM patients;"
```

Or using dbeaver, or another postgreSQL database GUI

## Database Schema

### Tables

#### `patients`
Stores patient information with demographics and contact details.

- `id` (UUID, Primary Key)
- `first_name`, `last_name` (VARCHAR)
- `date_of_birth` (DATE)
- `gender` (VARCHAR: 'male', 'female', 'other')
- `phone_number`, `email` (VARCHAR)
- Address fields: `address_street`, `address_city`, `address_state`, `address_zip_code`
- `medical_record_number` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

#### `notes`
Stores AI-generated clinical notes associated with patients.

- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key → patients.id)
- `title`, `content` (VARCHAR/TEXT)
- `input_type` (VARCHAR: 'text' or 'audio')
- `original_input` (TEXT) - Raw input before AI processing
- `audio_file_url` (VARCHAR) - Path to audio file
- Metadata fields: `metadata_duration`, `metadata_transcription_model`, `metadata_generation_model`, `metadata_confidence`
- `status` (VARCHAR: 'draft', 'completed', 'reviewed')
- `created_by` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

### Indexes

Performance indexes are created on:
- `notes.patient_id` - Fast patient note lookup
- `notes.created_at` - Chronological ordering
- `notes.status` - Status filtering
- `patients.last_name` - Patient search
- `patients.medical_record_number` - MRN lookup

### Permission Issues

Grant proper permissions:
```bash
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE lime_scribe TO lime_user;
\c lime_scribe
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lime_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lime_user;
```
