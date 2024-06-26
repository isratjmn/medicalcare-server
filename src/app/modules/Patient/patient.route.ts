import express from "express";
import { PatientControllers } from "./patient.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", auth(UserRole.PATIENT), PatientControllers.getAllFromDB);

router.get("/:id", PatientControllers.getPatientById);

router.patch("/:id", PatientControllers.updateIntoDB);
router.delete("/:id", PatientControllers.deleteFromDB);
router.delete("/soft/:id", PatientControllers.softDeletefromDB);

export const PatientRoutes = router;
