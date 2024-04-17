
import { UserRole } from '@prisma/client';
import express from 'express';
import { MetaController } from './meta.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get("/",
    auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
    MetaController.fetchDashboardMetaData);

export const MetaRoutes = router;