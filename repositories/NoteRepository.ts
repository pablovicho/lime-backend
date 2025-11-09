import { pool } from "../db/database";
import { Note, CreateNoteInput, UpdateNoteInput, NoteWithPatient } from "../models/Note";

export class NoteRepository {
  async create(input: CreateNoteInput): Promise<Note> {
    const query = `
      INSERT INTO notes (
        patient_id, title, content, input_type, original_input,
        audio_file_url, metadata_duration, metadata_transcription_model,
        metadata_generation_model, metadata_confidence, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      input.patientId,
      input.title,
      input.content || "",
      input.inputType,
      input.originalInput || null,
      input.audioFileUrl || null,
      input.metadata?.duration || null,
      input.metadata?.transcriptionModel || null,
      input.metadata?.generationModel || null,
      input.metadata?.confidence || null,
      input.status || "draft",
      input.createdBy || null,
    ];

    const result = await pool.query(query, values);
    return this.mapRowToNote(result.rows[0]);
  }

  async findById(id: string): Promise<Note | null> {
    const query = "SELECT * FROM notes WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToNote(result.rows[0]);
  }

  async findByIdWithPatient(id: string): Promise<NoteWithPatient | null> {
    const query = `
      SELECT 
        n.*,
        p.id as patient_id,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.date_of_birth as patient_date_of_birth,
        p.medical_record_number as patient_medical_record_number
      FROM notes n
      INNER JOIN patients p ON n.patient_id = p.id
      WHERE n.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToNoteWithPatient(result.rows[0]);
  }

  async findByPatientId(patientId: string, limit = 50, offset = 0): Promise<Note[]> {
    const query = `
      SELECT * FROM notes
      WHERE patient_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [patientId, limit, offset]);
    return result.rows.map((row) => this.mapRowToNote(row));
  }

  async findAll(limit = 50, offset = 0): Promise<NoteWithPatient[]> {
    const query = `
      SELECT 
        n.*,
        p.id as patient_id,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.date_of_birth as patient_date_of_birth,
        p.medical_record_number as patient_medical_record_number
      FROM notes n
      INNER JOIN patients p ON n.patient_id = p.id
      ORDER BY n.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows.map((row) => this.mapRowToNoteWithPatient(row));
  }

  async update(id: string, input: UpdateNoteInput): Promise<Note | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(input.title);
    }
    if (input.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(input.content);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE notes
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToNote(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const query = "DELETE FROM notes WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async searchByTitle(searchTerm: string, limit = 50): Promise<NoteWithPatient[]> {
    const query = `
      SELECT 
        n.*,
        p.id as patient_id,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.date_of_birth as patient_date_of_birth,
        p.medical_record_number as patient_medical_record_number
      FROM notes n
      INNER JOIN patients p ON n.patient_id = p.id
      WHERE LOWER(n.title) LIKE LOWER($1)
      ORDER BY n.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return result.rows.map((row) => this.mapRowToNoteWithPatient(row));
  }

  private mapRowToNote(row: any): Note {
    return {
      id: row.id,
      patientId: row.patient_id,
      title: row.title,
      content: row.content,
      inputType: row.input_type,
      originalInput: row.original_input,
      audioFileUrl: row.audio_file_url,
      metadata: {
        duration: row.metadata_duration,
        transcriptionModel: row.metadata_transcription_model,
        generationModel: row.metadata_generation_model,
        confidence: row.metadata_confidence ? parseFloat(row.metadata_confidence) : undefined,
      },
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
    };
  }

  private mapRowToNoteWithPatient(row: any): NoteWithPatient {
    const note = this.mapRowToNote(row);
    return {
      ...note,
      patient: {
        id: row.patient_id,
        firstName: row.patient_first_name,
        lastName: row.patient_last_name,
        dateOfBirth: new Date(row.patient_date_of_birth),
        medicalRecordNumber: row.patient_medical_record_number,
      },
    };
  }
}
