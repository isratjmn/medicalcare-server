import express, { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.post("/",
    auth(UserRole.PATIENT),
    ReviewController.reviewIntoDB
);

export const ReviewRoutes = router;