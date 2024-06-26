"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const admin_validation_1 = require("./admin.validation");
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const validateReqyuest_1 = __importDefault(require("../../middlewares/validateReqyuest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get('/', 
// auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
admin_controller_1.AdminController.getAllAdminsFromDB);
router.get('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), admin_controller_1.AdminController.getByIdFromDB);
router.patch('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, validateReqyuest_1.default)(admin_validation_1.adminValidationSchema.update), admin_controller_1.AdminController.updateIntoDB);
router.delete('/:id', (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), admin_controller_1.AdminController.deleteFromDB);
router.delete('/soft/:id', admin_controller_1.AdminController.softDeleted);
exports.AdminRoutes = router;
