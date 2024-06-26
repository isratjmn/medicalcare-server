"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorScheduleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const doctorSchedule_controller_1 = require("./doctorSchedule.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DOCTOR, user_1.ENUM_USER_ROLE.PATIENT), doctorSchedule_controller_1.doctorScheduleController.getAllDoctorSchedule);
router.get("/my-schedule", (0, auth_1.default)(user_1.ENUM_USER_ROLE.DOCTOR), doctorSchedule_controller_1.doctorScheduleController.getMyDoctorSchedule);
router.post("/", (0, auth_1.default)(user_1.ENUM_USER_ROLE.DOCTOR), doctorSchedule_controller_1.doctorScheduleController.createDoctorSchedule);
router.delete("/:id", (0, auth_1.default)(user_1.ENUM_USER_ROLE.DOCTOR), doctorSchedule_controller_1.doctorScheduleController.deleteMyDoctorSchedule);
exports.doctorScheduleRoutes = router;
