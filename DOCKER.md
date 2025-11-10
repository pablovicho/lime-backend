# Docker Setup Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- `.env` file with your API keys (see below)

### 1. Create your `.env` file and add your OPENAI_API_KEY

### 2. Start everything with Docker Compose

```bash
docker-compose up -d
```

### 3. Access the API

- **API Base URL:** http://localhost:3000/api
- **Patients:** http://localhost:3000/api/patients
- **Notes:** http://localhost:3000/api/notes

## Stop docker

```bash
# Stop containers
docker-compose down
```

## Services Overview

### Three Services Run:

**1. PostgreSQL (postgres)**
- Image: `postgres:16-alpine`
- Port: `5432`
- Data: `postgres_data`
- Auto-runs: `schema.sql` and `seed.sql` on first start, so it creates the schema and seeds it with mock patients

**2. Backend API (backend)**
- Built from: `./Dockerfile`
- Port: `3000`
- Uses Node.js 22 + TypeScript + Express

**3. Frontend (frontend)**
- Built from: `../lime-frontend/Dockerfile` (so it's important to have the frontend on a sibling folder. TODO: improve this setback)
- Port: `4173`
