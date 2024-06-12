
import express from 'express';
import { doctorScheduleController } from './doctorSchedule.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get(
    '/',
    auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.DOCTOR, ENUM_USER_ROLE.PATIENT),
    doctorScheduleController.getAllDoctorSchedule);

router.get(
    "/my-schedule",
    auth(ENUM_USER_ROLE.DOCTOR),
    doctorScheduleController.getMyDoctorSchedule
);

router.post("/",
    auth(ENUM_USER_ROLE.DOCTOR),
    doctorScheduleController.createDoctorSchedule);

router.delete("/:id",
    auth(ENUM_USER_ROLE.DOCTOR),
    doctorScheduleController.deleteMyDoctorSchedule
);


export const doctorScheduleRoutes = router;