import { adminValidationSchema } from './admin.validation';
import express from 'express';
import { AdminController } from './admin.controller';
import { z } from "zod";
import validateRequest from '../../middlewares/validateReqyuest';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
const router = express.Router();


router.get('/',
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AdminController.getAllAdminsFromDB);

router.get('/:id',
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getByIdFromDB);

router.patch('/:id',
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validateRequest(adminValidationSchema.update), AdminController.updateIntoDB);

router.delete('/:id',
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.deleteFromDB);

router.delete('/soft/:id', AdminController.softDeleted);


export const AdminRoutes = router;