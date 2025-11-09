# AI Scribe Notes Management API

## Overview

The Audio Notes API allows you to upload audio files that will be:
1. **Transcribed** using OpenAI Whisper API
2. **Processed** into structured clinical notes using GPT-4o-mini
3. **Saved** to the database with both raw transcription and AI-generated summary

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Patients

#### Get All Patients
```
GET /api/patients?limit=50&offset=0
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1980-01-15T00:00:00.000Z",
      "gender": "male",
      "phoneNumber": "555-1234",
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Springfield",
        "state": "IL",
        "zipCode": "62701"
      },
      "medicalRecordNumber": "MRN12345",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Patient by ID
```
GET /api/patients/:id
```

#### Create Patient
```
POST /api/patients
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-05-20",
  "gender": "female",
  "phoneNumber": "555-5678",
  "email": "jane.smith@example.com",
  "address": {
    "street": "456 Oak Ave",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601"
  },
  "medicalRecordNumber": "MRN67890"
}
```

#### Update Patient
```
PATCH /api/patients/:id
Content-Type: application/json

{
  "phoneNumber": "555-9999",
  "email": "newemail@example.com"
}
```

#### Delete Patient
```
DELETE /api/patients/:id
```

#### Search Patients
```
GET /api/patients/search?q=john&limit=50
```

---

### Notes

#### Get All Notes (with Patient Details)
```
GET /api/notes?limit=50&offset=0
```

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": [
    {
      "id": "uuid",
      "patientId": "patient-uuid",
      "title": "Initial Consultation",
      "content": "Patient presents with...",
      "inputType": "text",
      "originalInput": "Raw input text",
      "audioFileUrl": null,
      "metadata": {
        "duration": null,
        "transcriptionModel": null,
        "generationModel": "gpt-4",
        "confidence": null
      },
      "status": "completed",
      "createdBy": "Dr. Smith",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "patient": {
        "id": "patient-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1980-01-15T00:00:00.000Z",
        "medicalRecordNumber": "MRN12345"
      }
    }
  ]
}
```

#### Get Note by ID
```
GET /api/notes/:id?includePatient=true
```

Query Parameters:
- `includePatient` (optional): Include patient details in response (default: false)

#### Create Note
```
POST /api/notes
Content-Type: application/json

{
  "patientId": "patient-uuid",
  "title": "Follow-up Visit",
  "content": "Patient shows improvement...",
  "inputType": "text",
  "originalInput": "Doctor's raw notes",
  "status": "draft",
  "createdBy": "Dr. Johnson",
  "metadata": {
    "generationModel": "gpt-4"
  }
}
```

**For Audio Input:**
```json
{
  "patientId": "patient-uuid",
  "title": "Audio Consultation",
  "content": "Transcribed and generated note content",
  "inputType": "audio",
  "originalInput": "Transcribed text from audio",
  "audioFileUrl": "/uploads/audio/recording123.mp3",
  "status": "completed",
  "createdBy": "Dr. Smith",
  "metadata": {
    "duration": 300,
    "transcriptionModel": "whisper-1",
    "generationModel": "gpt-4",
    "confidence": 0.95
  }
}
```

#### Update Note
```
PATCH /api/notes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "status": "reviewed"
}
```

### Create Audio Note

**POST** `/api/notes/audio`

Upload an audio file, transcribe it, generate a clinical note, and save to database.

#### Audio Request

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `audio` (file, required): Audio file (mp3, wav, m4a, webm, ogg)
- `patientId` (string, required): UUID of the patient
- `title` (string, required): Title for the note
- `createdBy` (string, optional): Name of the person creating the note

**File Constraints:**
- Maximum file size: 25MB
- Supported formats: mp3, wav, m4a, webm, ogg
- Audio duration: Up to ~2 hours (depending on file size)

#### Response

**Status:** `201 Created`

```json
{
  "status": "success",
  "data": {
    "note": {
      "id": "uuid",
      "patientId": "patient-uuid",
      "title": "Initial Consultation Recording",
      "content": "SOAP Note:\n\nSubjective:\nPatient reports...",
      "inputType": "audio",
      "originalInput": "Raw transcription text from audio...",
      "audioFileUrl": "/uploads/audio-1234567890.mp3",
      "metadata": {
        "duration": 180,
        "transcriptionModel": "whisper-1",
        "generationModel": "gpt-4o-mini",
        "confidence": null
      },
      "status": "completed",
      "createdBy": "Dr. Smith",
      "createdAt": "2025-01-09T00:00:00.000Z",
      "updatedAt": "2025-01-09T00:00:00.000Z"
    },
    "processing": {
      "transcription": "Raw transcription text from audio...",
      "summary": "Patient presents with acute symptoms...",
      "audioFile": "audio-1234567890.mp3"
    }
  }
}

## Data Flow

```
1. Audio File Upload
   ↓
2. File Validation (format, size)
   ↓
3. OpenAI Whisper Transcription
   ↓
4. GPT-4o-mini Clinical Note Generation
   ↓
5. Save to Database:
   - content: AI-generated clinical note
   - originalInput: Raw transcription
   - audioFileUrl: File path
   - metadata: Models used, duration, etc.
   ↓
6. Return Complete Note + Processing Details
```

## AI Processing Details

### Transcription (Whisper)
- Model: `whisper-1`
- Converts speech to text
- Preserves medical terminology
- Handles various accents and audio qualities

### Clinical Note Generation
- Generates SOAP format notes when applicable
- Creates structured clinical documentation
- Provides a brief summary (2-3 sentences)
- Optimized for medical/healthcare context
