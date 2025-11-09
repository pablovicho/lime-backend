import type { Request, Response } from "express";
import { NoteRepository } from "../repositories/NoteRepository";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const noteRepo = new NoteRepository();

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteRepo.create(req.body);
  res.status(201).json({
    status: "success",
    data: note,
  });
});

export const getNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const includePatient = req.query.includePatient === "true";

  const note = includePatient
    ? await noteRepo.findByIdWithPatient(id)
    : await noteRepo.findById(id);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: note,
  });
});

export const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const notes = await noteRepo.findAll(limit, offset);

  res.status(200).json({
    status: "success",
    results: notes.length,
    data: notes,
  });
});

export const getNotesByPatient = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const notes = await noteRepo.findByPatientId(patientId, limit, offset);

  res.status(200).json({
    status: "success",
    results: notes.length,
    data: notes,
  });
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const note = await noteRepo.update(id, req.body);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: note,
  });
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await noteRepo.delete(id);

  if (!deleted) {
    throw new AppError("Note not found", 404);
  }

  res.status(204).send();
});

export const searchNotes = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    throw new AppError("Search query parameter 'q' is required", 400);
  }

  const limit = parseInt(req.query.limit as string) || 50;
  const notes = await noteRepo.searchByTitle(q, limit);

  res.status(200).json({
    status: "success",
    results: notes.length,
    data: notes,
  });
});
