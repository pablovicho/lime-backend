export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  medicalRecordNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  medicalRecordNumber?: string;
}
