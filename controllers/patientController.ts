import type { Request, Response } from "express";
import { PatientRepository } from "../repositories/PatientRepository";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const patientRepo = new PatientRepository();

export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientRepo.create(req.body);
  res.status(201).json({
    status: "success",
    data: patient,
  });
});

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await patientRepo.findById(id);

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: patient,
  });
});

export const getAllPatients = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const patients = await patientRepo.findAll(limit, offset);

  res.status(200).json({
    status: "success",
    results: patients.length,
    data: patients,
  });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await patientRepo.update(id, req.body);

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: patient,
  });
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await patientRepo.delete(id);

  if (!deleted) {
    throw new AppError("Patient not found", 404);
  }

  res.status(204).send();
});

export const searchPatients = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    throw new AppError("Search query parameter 'q' is required", 400);
  }

  const limit = parseInt(req.query.limit as string) || 50;
  const patients = await patientRepo.searchByName(q, limit);

  res.status(200).json({
    status: "success",
    results: patients.length,
    data: patients,
  });
});
