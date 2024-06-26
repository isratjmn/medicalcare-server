"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialitiesRouters = void 0;
const express_1 = __importDefault(require("express"));
const specialities_controller_1 = require("./specialities.controller");
const FileUploader_1 = require("../../../helpers/FileUploader");
const specialities_validation_1 = require("./specialities.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DOCTOR), FileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    req.body = specialities_validation_1.specialitiesvalidation.createSchema.parse(JSON.parse(req.body.data));
    return specialities_controller_1.SpecialitiesController.insertIntoDB(req, res, next);
});
router.delete("/:id", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), specialities_controller_1.SpecialitiesController.deleteFromDB);
router.get("/", specialities_controller_1.SpecialitiesController.getAllFromDB);
exports.SpecialitiesRouters = router;
