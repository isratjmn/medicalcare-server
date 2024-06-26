"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = require("./doctor.controller");
const router = express_1.default.Router();
router.get('/', doctor_controller_1.DoctorController.getAllFromDB);
router.get('/:id', doctor_controller_1.DoctorController.getByIdFromDB);
router.patch('/:id', doctor_controller_1.DoctorController.updateIntoDB);
router.delete('/:id', doctor_controller_1.DoctorController.deleteFromDB);
router.delete('/soft/:id', doctor_controller_1.DoctorController.softDeletedFromBD);
exports.DoctorRoutes = router;
