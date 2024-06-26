import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.post("/",
    auth(UserRole.PATIENT),
    ReviewController.reviewIntoDB
);
router.get("/", ReviewController.allReviewsFromDB);
router.get("/:id", ReviewController.getReviewFromDB);

export const ReviewRoutes = router;