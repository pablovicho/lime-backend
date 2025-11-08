export interface Note {
  id: string;
  patientId: string;
  title: string;
  content: string;
  inputType: "text" | "audio";
  originalInput?: string;
  audioFileUrl?: string;
  metadata?: {
    duration?: number;
    transcriptionModel?: string;
    generationModel?: string;
    confidence?: number;
  };
  status: "draft" | "completed" | "reviewed";
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateNoteInput {
  patientId: string;
  title: string;
  content?: string;
  inputType: "text" | "audio";
  originalInput?: string;
  audioFileUrl?: string;
  metadata?: {
    duration?: number;
    transcriptionModel?: string;
    generationModel?: string;
    confidence?: number;
  };
  status?: "draft" | "completed" | "reviewed";
  createdBy?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  status?: "draft" | "completed" | "reviewed";
}

export interface NoteWithPatient extends Note {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    medicalRecordNumber?: string;
  };
}
