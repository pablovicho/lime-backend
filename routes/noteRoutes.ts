import { Router } from "express";
import * as noteController from "../controllers/noteController";

const router = Router();

router
  .route("/")
  .get(noteController.getAllNotes)
  .post(noteController.createNote);

router.get("/search", noteController.searchNotes);

router.get("/patient/:patientId", noteController.getNotesByPatient);

router
  .route("/:id")
  .get(noteController.getNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

export default router;
