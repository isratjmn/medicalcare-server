"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/User/user.routes");
const admin_routes_1 = require("../modules/Admin/admin.routes");
const auth_route_1 = require("../modules/Auth/auth.route");
const specialities_route_1 = require("../modules/Specialities/specialities.route");
const doctor_routes_1 = require("../modules/Doctor/doctor.routes");
const patient_route_1 = require("../modules/Patient/patient.route");
const schedule_route_1 = require("../modules/Schedule/schedule.route");
const doctorSchedule_route_1 = require("../modules/DoctorSchedules/doctorSchedule.route");
const appointment_routes_1 = require("../modules/Appointment/appointment.routes");
const payment_routes_1 = require("../modules/Payment/payment.routes");
const prescription_routes_1 = require("../modules/Prescription/prescription.routes");
const review_routes_1 = require("../modules/Review/review.routes");
const meta_routes_1 = require("../modules/Meta/meta.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/user",
        route: user_routes_1.UserRoutes,
    },
    {
        path: "/admin",
        route: admin_routes_1.AdminRoutes,
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRouters,
    },
    {
        path: "/specialities",
        route: specialities_route_1.SpecialitiesRouters,
    },
    {
        path: "/doctor",
        route: doctor_routes_1.DoctorRoutes,
    },
    {
        path: "/patient",
        route: patient_route_1.PatientRoutes,
    },
    {
        path: "/schedule",
        route: schedule_route_1.ScheduleRoutes,
    },
    {
        path: "/doctor-schedule",
        route: doctorSchedule_route_1.doctorScheduleRoutes,
    },
    {
        path: "/appointment",
        route: appointment_routes_1.AppointmentRoutes,
    },
    {
        path: "/payment",
        route: payment_routes_1.PaymentRoutes,
    },
    {
        path: "/prescription",
        route: prescription_routes_1.PrescriptionRoutes,
    },
    {
        path: "/review",
        route: review_routes_1.ReviewRoutes,
    },
    {
        path: "/meta",
        route: meta_routes_1.MetaRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
