# AI Scribe Notes Management Tool

A lightweight healthcare compliance tool that generates AI-powered clinical notes from audio or text input, built with Node.js, TypeScript, PostgreSQL, and React.

## Overview

This application allows healthcare providers to:
- Create AI-generated clinical notes from audio recordings or typed text
- Automatically transcribe audio using OpenAI Whisper
- Generate structured SOAP-format
- Associate notes with patient records
- View and manage all clinical notes with patient details

## Project Structure

**Important:** This project requires both backend and frontend in **sibling directories**:

## Quick Start

### Option 1: Docker

1. **Clone both repositories:**
   ```bash
   mkdir lime && cd lime
   git clone <backend-repo-url> lime-backend
   git clone <frontend-repo-url> lime-frontend
   ```

2. **Set up environment:**
   ```bash
   cd lime-backend
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Start everything:**
   ```bash
   docker compose up -d
   ```

4. **Access the application:**
   -  **Frontend:** http://localhost:4173
   -  **Backend API:** http://localhost:3000/api
   -  **Database:** localhost:5432

### Option 2: Local Development

#### Backend Setup

```bash
cd lime-backend
pnpm install

# create .env file with your database credentials and OpenAI API key

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE lime_scribe;"
sudo -u postgres psql -c "CREATE USER lime_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lime_scribe TO lime_user;"

# Run schema and seed data
PGPASSWORD=your_password psql -U lime_user -d lime_scribe -h localhost -f db/schema.sql
PGPASSWORD=your_password psql -U lime_user -d lime_scribe -h localhost -f db/seed.sql

# Start server
pnpm run dev
```

#### Frontend Setup

```bash
cd ../lime-frontend
pnpm install
pnpm run dev
```

## API Endpoints

### Patients
```
GET    /api/patients              List all patients
GET    /api/patients/:id          Get patient by ID
POST   /api/patients              Create patient
PATCH  /api/patients/:id          Update patient
DELETE /api/patients/:id          Delete patient
GET    /api/patients/search?q=    Search patients by name
```

### Notes
```
GET    /api/notes                  List all notes (with patient details)
GET    /api/notes/:id              Get note by ID
POST   /api/notes                  Create text note
POST   /api/notes/audio            Upload audio → transcribe → generate note
PATCH  /api/notes/:id              Update note
DELETE /api/notes/:id              Delete note
GET    /api/notes/patient/:id      Get notes by patient
GET    /api/notes/search?q=        Search notes by title
```

## TODOS

Due to time constraints for this demo project:

1. Implement Authentication
2. Implement Authorization
3. Use S3/cloud storage instead of local storage
4. Improve Error Handling
5. Implement Throttling
6. Implement Caching
