"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const schedule_controller_1 = require("./schedule.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), schedule_controller_1.ScheduleController.createScheduleIntoDB);
router.get("/", (0, auth_1.default)(client_1.UserRole.DOCTOR), schedule_controller_1.ScheduleController.getAllScheduleFromDB);
router.get("/:id", schedule_controller_1.ScheduleController.getScheduleByIdFromDB);
exports.ScheduleRoutes = router;
