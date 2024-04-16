import express from "express";
import { PatientControllers } from "./patient.controller";

const router = express.Router();

router.get("/", PatientControllers.getAllFromDB);
router.get("/:id", PatientControllers.getPatientById);
router.patch('/:id', PatientControllers.updateIntoDB);
router.delete('/:id', PatientControllers.deleteFromDB);
router.delete('/soft/:id', PatientControllers.softDeletefromDB);

export const PatientRoutes = router;
