"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const user_constant_1 = require("./user.constant");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const FileUploader_1 = require("../../../helpers/FileUploader");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const user_utils_1 = require("./user.utils");
const APIErrors_1 = __importDefault(require("../../errors/APIErrors"));
const http_status_1 = __importDefault(require("http-status"));
const createAdmin = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (file) {
        const uploadResult = yield FileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.admin.profilePhoto = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const hasedPassword = yield (0, user_utils_1.hashedPassword)(req.body.password);
    const userData = {
        email: req.body.admin.email,
        password: hasedPassword,
        role: client_1.UserRole.ADMIN,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createAdminData = yield transactionClient.admin.create({
            data: req.body.admin,
        });
        return createAdminData;
    }));
    return result;
});
const createDoctor = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (file) {
        // If a file is uploaded, upload it to Cloudinary
        const uploadResult = yield FileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.doctor.profilePhoto = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const hasedPassword = yield (0, user_utils_1.hashedPassword)(req.body.password);
    const userData = {
        email: req.body.doctor.email,
        password: hasedPassword,
        role: client_1.UserRole.DOCTOR,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createDoctorData = yield transactionClient.doctor.create({
            data: req.body.doctor,
        });
        return createDoctorData;
    }));
    return result;
});
const createPatient = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (file) {
        const uploadResult = yield FileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.patient.profilePhoto = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const hasedPassword = yield (0, user_utils_1.hashedPassword)(req.body.password);
    const userData = {
        email: req.body.patient.email,
        password: hasedPassword,
        role: client_1.UserRole.PATIENT,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createPatientData = yield transactionClient.patient.create({
            data: req.body.patient,
        });
        return createPatientData;
    }));
    return result;
});
const getAllUser = (options, params) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andConditions = [];
    // Handle search term
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchAbleFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    // Handle filter data
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : undefined,
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            admin: true,
            patient: true,
            doctor: true,
        },
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const changeProfileStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const updateuserStatus = yield prisma_1.default.user.update({
        where: {
            id,
        },
        data: status,
    });
    return updateuserStatus;
});
const getMyProfile = (authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            id: authUser.userId,
            status: client_1.UserStatus.ACTIVE,
        },
        select: {
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
        },
    });
    let profileData;
    if ((userData === null || userData === void 0 ? void 0 : userData.role) === client_1.UserRole.ADMIN) {
        profileData = yield prisma_1.default.admin.findUnique({
            where: {
                email: userData.email,
            },
        });
    }
    else if ((userData === null || userData === void 0 ? void 0 : userData.role) === client_1.UserRole.DOCTOR) {
        profileData = yield prisma_1.default.doctor.findUnique({
            where: {
                email: userData.email,
            },
        });
    }
    else if ((userData === null || userData === void 0 ? void 0 : userData.role) === client_1.UserRole.PATIENT) {
        profileData = yield prisma_1.default.patient.findUnique({
            where: {
                email: userData.email,
            },
        });
    }
    return Object.assign(Object.assign({}, profileData), userData);
});
const updateMyProfile = (authUser, req) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            id: authUser.userId,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!userData) {
        throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "User does not exists!");
    }
    const file = req.file;
    if (file) {
        const uploadedProfileImage = yield FileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = uploadedProfileImage === null || uploadedProfileImage === void 0 ? void 0 : uploadedProfileImage.secure_url;
    }
    let profileData;
    if ((userData === null || userData === void 0 ? void 0 : userData.role) === client_1.UserRole.ADMIN) {
        profileData = yield prisma_1.default.admin.update({
            where: {
                email: userData.email,
            },
            data: req.body,
        });
    }
    else if ((userData === null || userData === void 0 ? void 0 : userData.role) === client_1.UserRole.DOCTOR) {
        profileData = yield prisma_1.default.doctor.update({
            where: {
                email: userData.email,
            },
            data: req.body,
        });
    }
    else if ((userData === null || userData === void 0 ? void 0 : userData.role) === client_1.UserRole.PATIENT) {
        profileData = yield prisma_1.default.patient.update({
            where: {
                email: userData.email,
            },
            data: req.body,
        });
    }
    return Object.assign(Object.assign({}, profileData), userData);
});
exports.userService = {
    createAdmin,
    createDoctor,
    createPatient,
    getAllUser,
    changeProfileStatus,
    getMyProfile,
    updateMyProfile,
};
