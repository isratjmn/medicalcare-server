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
exports.DoctorServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const doctor_constant_1 = require("./doctor.constant");
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const APIErrors_1 = __importDefault(require("../../errors/APIErrors"));
const http_status_1 = __importDefault(require("http-status"));
const utils_1 = require("../../../shared/utils");
const getAllDoctors = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, specialities } = filters, filterData = __rest(filters, ["searchTerm", "specialities"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: doctor_constant_1.doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (specialities && specialities.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialities: {
                        title: {
                            contains: specialities,
                            mode: "insensitive",
                        },
                    },
                },
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: filterData[key],
            },
        }));
        andConditions.push(...filterConditions);
    }
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = andConditions.length > 0
        ? {
            AND: andConditions,
        }
        : {};
    const result = yield prisma_1.default.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? {
                [options.sortBy]: options.sortOrder,
            }
            : { averageRating: "desc" },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
        },
    });
    const transformedResult = result.map((doctor) => (Object.assign(Object.assign({}, doctor), { specialities: doctor.doctorSpecialties.map((ds) => ds.specialities) })));
    const total = yield prisma_1.default.doctor.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: transformedResult,
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
            doctorSchedules: true,
            review: true,
        },
    });
    return result;
});
const updateIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const { specialities } = payload, doctorData = __rest(payload, ["specialities"]);
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield transactionClient.doctor.update({
            where: {
                id,
            },
            data: doctorData,
        });
        if (!result) {
            throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "Unable to update Doctor");
        }
        if (specialities && specialities.length > 0) {
            const deleteSpecialities = specialities.filter((speciality) => speciality.specialitiesId && speciality.isDeleted);
            const newSpecialities = specialities.filter((speciality) => speciality.specialitiesId && !speciality.isDeleted);
            yield (0, utils_1.asyncForEach)(deleteSpecialities, (deleteDoctorSpeciality) => __awaiter(void 0, void 0, void 0, function* () {
                yield transactionClient.doctorSpecialties.deleteMany({
                    where: {
                        AND: [
                            {
                                doctorId: id,
                            },
                            {
                                specialitiesId: deleteDoctorSpeciality.specialitiesId,
                            },
                        ],
                    },
                });
            }));
            yield (0, utils_1.asyncForEach)(newSpecialities, (insertDoctorSpeciality) => __awaiter(void 0, void 0, void 0, function* () {
                //@ Need For Already Added Specialities
                const existingSpecialities = yield prisma_1.default.doctorSpecialties.findFirst({
                    where: {
                        doctorId: id,
                        specialitiesId: insertDoctorSpeciality.specialitiesId,
                    },
                });
                if (!existingSpecialities) {
                    yield transactionClient.doctorSpecialties.create({
                        data: {
                            doctorId: id,
                            specialitiesId: insertDoctorSpeciality.specialitiesId,
                        },
                    });
                }
            }));
        }
        return result;
    }));
    const responseData = yield prisma_1.default.doctor.findUnique({
        where: {
            id,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
        },
    });
    return responseData;
});
const deleteDoctor = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((transcationClient) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorDeletedData = yield transcationClient.doctor.delete({
            where: {
                id,
            },
        });
        yield transcationClient.user.delete({
            where: {
                email: doctorDeletedData.email,
            },
        });
        return doctorDeletedData;
    }));
    return result;
});
const softDelete = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((transcationClient) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorDeletedData = yield transcationClient.doctor.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transcationClient.user.update({
            where: {
                email: doctorDeletedData.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return doctorDeletedData;
    }));
    return result;
});
exports.DoctorServices = {
    getAllDoctors,
    getByIdFromDB,
    updateIntoDB,
    deleteDoctor,
    softDelete,
};
