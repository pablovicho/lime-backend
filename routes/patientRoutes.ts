import { Router } from "express";
import * as patientController from "../controllers/patientController";

const router = Router();

router
  .route("/")
  .get(patientController.getAllPatients)
  .post(patientController.createPatient);

router.get("/search", patientController.searchPatients);

router
  .route("/:id")
  .get(patientController.getPatient)
  .patch(patientController.updatePatient)
  .delete(patientController.deletePatient);

export default router;
