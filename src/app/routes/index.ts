import express from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { AdminRoutes } from '../modules/Admin/admin.routes';
import { AuthRouters } from '../modules/Auth/auth.route';
import { SpecialitiesRouters } from '../modules/Specialities/specialities.route';
import { DoctorRoutes } from '../modules/Doctor/doctor.routes';
import { PatientRoutes } from '../modules/Patient/patient.route';
import { ScheduleRoutes } from '../modules/Schedule/schedule.route';
import { doctorScheduleRoutes } from '../modules/DoctorSchedules/doctorSchedule.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/admin",
        route: AdminRoutes
    },
    {
        path: "/auth",
        route: AuthRouters
    },
    {
        path: "/specialities",
        route: SpecialitiesRouters
    },
    {
        path: "/doctor",
        route: DoctorRoutes
    },
    {
        path: "/patient",
        route: PatientRoutes
    },
    {
        path: "/schedule",
        route: ScheduleRoutes
    },
    {
        path: "/doctor-schedule",
        route: doctorScheduleRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;