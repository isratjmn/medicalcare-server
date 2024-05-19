
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/FileUploader";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.get("/",
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    userController.getAllFromDB
);

router.get(
    '/me',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    userController.getMyProfile
);

router.patch(
    "/:id/status",
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    userController.changeProfileStatus
);


router.patch('/update-my-profile',
    auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT),
    fileUploader.upload.single('file'),

    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        return userController.updateMyProfile(req, res, next);
    }
);


router.post("/create-admin",
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createAdmin.parse(JSON.parse(
            req.body.data
        ));
        return userController.createAdmin(req, res, next);
    }
);

router.post("/create-doctor", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createDoctor.parse(JSON.parse(
            req.body.data
        ));
        return userController.createDoctor(req, res, next);
    }
);

router.post("/create-patient",
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createPatient.parse(JSON.parse(
            req.body.data
        ));
        return userController.createPatient(req, res, next);
    }
);


export const UserRoutes = router;