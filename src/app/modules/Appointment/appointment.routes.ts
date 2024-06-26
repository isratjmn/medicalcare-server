import express from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
	"/my-appointment",
	auth(UserRole.PATIENT, UserRole.DOCTOR),
	AppointmentController.getMyAppointment
);

router.post(
	"/",
	auth(UserRole.PATIENT),
	AppointmentController.createAppointment
);

/*
get all appointments with filter 
only accessable for admin & Super Admin
endpoint: /appointment 
 */

router.patch(
	"/status/:id",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR),
	AppointmentController.changeAppointmentStatus
);

export const AppointmentRoutes = router;
