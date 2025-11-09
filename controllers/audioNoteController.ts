import type { Request, Response } from "express";
import { NoteRepository } from "../repositories/NoteRepository";
import { PatientRepository } from "../repositories/PatientRepository";
import { processAudioNote } from "../services/openaiService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import fs from "fs/promises";
import path from "path";

const noteRepo = new NoteRepository();
const patientRepo = new PatientRepository();

/**
 * POST /api/notes/audio
 */
export const createAudioNote = asyncHandler(async (req: Request, res: Response) => {

  if (!req.file) {
    throw new AppError("No audio file uploaded", 400);
  }

  const { patientId, title, createdBy } = req.body;

  if (!patientId) {
    await fs.unlink(req.file.path);
    throw new AppError("patientId is required", 400);
  }

  if (!title) {
    await fs.unlink(req.file.path);
    throw new AppError("title is required", 400);
  }

  const patient = await patientRepo.findById(patientId);
  if (!patient) {
    await fs.unlink(req.file.path);
    throw new AppError("Patient not found", 404);
  }

  try {
    const result = await processAudioNote(req.file.path);

    const note = await noteRepo.create({
      patientId,
      title,
      content: result.note.clinicalNote,
      inputType: "audio",
      originalInput: result.transcription.text,
      audioFileUrl: `/uploads/${req.file.filename}`,
      status: "completed",
      createdBy: createdBy || "system",
      metadata: {
        duration: result.transcription.duration,
        transcriptionModel: "whisper-1",
        generationModel: "gpt-4o-mini",
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        note,
        processing: {
          transcription: result.transcription.text,
          summary: result.note.summary,
          audioFile: req.file.filename,
        },
      },
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

/**
 * GET /api/notes/:id/audio
 */
export const getAudioFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const note = await noteRepo.findById(id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (!note.audioFileUrl) {
    throw new AppError("No audio file associated with this note", 404);
  }

  const filePath = path.join(
    process.cwd(),
    "static",
    note.audioFileUrl.replace(/^\//, "")
  );

  try {
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch (error) {
    throw new AppError("Audio file not found", 404);
  }
});
