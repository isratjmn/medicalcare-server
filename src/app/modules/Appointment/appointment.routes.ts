import express from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/my-appointment",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointment);

router.post("/",
    auth(UserRole.PATIENT),
    // Add Zod Validation to Create Appointment
    AppointmentController.createAppointment);


/*
get all appointments with filter 
only accessable for admin & Super Admin
endpoint: /appointment 
 */

export const AppointmentRoutes = router;