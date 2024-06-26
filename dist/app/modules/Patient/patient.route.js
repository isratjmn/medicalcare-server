"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRoutes = void 0;
const express_1 = __importDefault(require("express"));
const patient_controller_1 = require("./patient.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/", (0, auth_1.default)(client_1.UserRole.PATIENT), patient_controller_1.PatientControllers.getAllFromDB);
router.get("/:id", patient_controller_1.PatientControllers.getPatientById);
router.patch("/:id", patient_controller_1.PatientControllers.updateIntoDB);
router.delete("/:id", patient_controller_1.PatientControllers.deleteFromDB);
router.delete("/soft/:id", patient_controller_1.PatientControllers.softDeletefromDB);
exports.PatientRoutes = router;
