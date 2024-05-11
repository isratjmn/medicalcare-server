
import express, { NextFunction, Request, Response } from "express";
import { SpecialitiesController } from "./specialities.controller";
import { fileUploader } from "../../../helpers/FileUploader";
import { specialitiesvalidation } from "./specialities.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.post('/',
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = specialitiesvalidation.createSchema.parse(JSON.parse(req.body.data));

        return SpecialitiesController.insertIntoDB(req, res, next);
    }
);

router.delete("/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    SpecialitiesController.deleteFromDB
);

router.get("/", SpecialitiesController.getAllFromDB);

export const SpecialitiesRouters = router