import { pool } from "../db/database.js";
import { Patient, CreatePatientInput } from "../models/Patient.js";

export class PatientRepository {
  async create(input: CreatePatientInput): Promise<Patient> {
    const query = `
      INSERT INTO patients (
        first_name, last_name, date_of_birth, gender,
        phone_number, email, address_street, address_city,
        address_state, address_zip_code, medical_record_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      input.firstName,
      input.lastName,
      input.dateOfBirth,
      input.gender || null,
      input.phoneNumber || null,
      input.email || null,
      input.address?.street || null,
      input.address?.city || null,
      input.address?.state || null,
      input.address?.zipCode || null,
      input.medicalRecordNumber || null,
    ];

    const result = await pool.query(query, values);
    return this.mapRowToPatient(result.rows[0]);
  }

  async findById(id: string): Promise<Patient | null> {
    const query = "SELECT * FROM patients WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPatient(result.rows[0]);
  }

  async findAll(limit = 50, offset = 0): Promise<Patient[]> {
    const query = `
      SELECT * FROM patients
      ORDER BY last_name, first_name
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows.map((row) => this.mapRowToPatient(row));
  }

  async update(id: string, input: Partial<CreatePatientInput>): Promise<Patient | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.firstName !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(input.firstName);
    }
    if (input.lastName !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(input.lastName);
    }
    if (input.dateOfBirth !== undefined) {
      fields.push(`date_of_birth = $${paramCount++}`);
      values.push(input.dateOfBirth);
    }
    if (input.gender !== undefined) {
      fields.push(`gender = $${paramCount++}`);
      values.push(input.gender);
    }
    if (input.phoneNumber !== undefined) {
      fields.push(`phone_number = $${paramCount++}`);
      values.push(input.phoneNumber);
    }
    if (input.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(input.email);
    }
    if (input.address?.street !== undefined) {
      fields.push(`address_street = $${paramCount++}`);
      values.push(input.address.street);
    }
    if (input.address?.city !== undefined) {
      fields.push(`address_city = $${paramCount++}`);
      values.push(input.address.city);
    }
    if (input.address?.state !== undefined) {
      fields.push(`address_state = $${paramCount++}`);
      values.push(input.address.state);
    }
    if (input.address?.zipCode !== undefined) {
      fields.push(`address_zip_code = $${paramCount++}`);
      values.push(input.address.zipCode);
    }
    if (input.medicalRecordNumber !== undefined) {
      fields.push(`medical_record_number = $${paramCount++}`);
      values.push(input.medicalRecordNumber);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE patients
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPatient(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const query = "DELETE FROM patients WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async searchByName(searchTerm: string, limit = 50): Promise<Patient[]> {
    const query = `
      SELECT * FROM patients
      WHERE LOWER(first_name) LIKE LOWER($1)
         OR LOWER(last_name) LIKE LOWER($1)
      ORDER BY last_name, first_name
      LIMIT $2
    `;
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return result.rows.map((row) => this.mapRowToPatient(row));
  }

  private mapRowToPatient(row: any): Patient {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: new Date(row.date_of_birth),
      gender: row.gender,
      phoneNumber: row.phone_number,
      email: row.email,
      address: {
        street: row.address_street,
        city: row.address_city,
        state: row.address_state,
        zipCode: row.address_zip_code,
      },
      medicalRecordNumber: row.medical_record_number,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
