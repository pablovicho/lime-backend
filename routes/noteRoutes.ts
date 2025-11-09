import { Router } from "express";
import * as noteController from "../controllers/noteController";
import * as audioNoteController from "../controllers/audioNoteController";
import { upload } from "../middleware/upload";

const router = Router();

router
  .route("/")
  .get(noteController.getAllNotes)
  .post(noteController.createNote);

router.get("/search", noteController.searchNotes);

router.get("/patient/:patientId", noteController.getNotesByPatient);

router.post("/audio", upload.single("audio"), audioNoteController.createAudioNote);

router
  .route("/:id")
  .get(noteController.getNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

export default router;
