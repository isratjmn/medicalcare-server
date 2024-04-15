import express, { Router } from "express";
import { PrescriptionControllers } from "./prescription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.DOCTOR),
    PrescriptionControllers.InsertPrescriptionIntoDB
);

export const PrescriptionRoutes = router;