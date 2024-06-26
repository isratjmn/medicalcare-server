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
exports.PatientServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const patient_constant_1 = require("./patient.constant");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const getAllPatient = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: patient_constant_1.patientSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: filterData[key],
                    },
                };
            }),
        });
    }
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.patient.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
        include: {
            medicalReport: true,
            patienthealthData: true,
        },
    });
    const total = yield prisma_1.default.patient.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const singlePatientt = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            medicalReport: true,
            patienthealthData: true,
        },
    });
    return result;
});
const updatePatient = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { patienthealthData, medicalReport } = payload, patientData = __rest(payload, ["patienthealthData", "medicalReport"]);
    const patientInfo = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.patient.update({
            where: {
                id,
            },
            data: patientData,
            include: {
                patienthealthData: true,
                medicalReport: true,
            },
        });
        // Create or Update Patient health Data
        if (patienthealthData) {
            yield transactionClient.patienthealthData.upsert({
                where: {
                    patientId: patientInfo.id,
                },
                update: patienthealthData,
                create: Object.assign(Object.assign({}, patienthealthData), { patientId: patientInfo.id }),
            });
        }
        if (medicalReport) {
            yield transactionClient.medicalReport.create({
                data: Object.assign(Object.assign({}, medicalReport), { patientId: patientInfo.id }),
            });
        }
    }));
    const responseData = yield prisma_1.default.patient.findUnique({
        where: {
            id: patientInfo.id,
        },
        include: {
            patienthealthData: true,
            medicalReport: true,
        },
    });
    return responseData;
});
const deletePatient = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete medical Report
        yield tx.medicalReport.deleteMany({
            where: {
                patientId: id,
            },
        });
        // Check if patient health data exists before attempting to delete
        const existingHealthData = yield tx.patienthealthData.findMany({
            where: {
                patientId: id,
            },
        });
        if (existingHealthData) {
            // Delete Patient Health Data
            yield tx.patienthealthData.deleteMany({
                where: {
                    patientId: id,
                },
            });
        }
        const deletedPatient = tx.patient.delete({
            where: {
                id,
            },
        });
        yield tx.user.delete({
            where: {
                email: (yield deletedPatient).email,
            },
        });
        return deletedPatient;
    }));
    return result;
});
const softDeletePatient = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const deletedPatient = yield transactionClient.patient.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: deletedPatient.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return deletedPatient;
    }));
});
exports.PatientServices = {
    getAllPatient,
    singlePatientt,
    updatePatient,
    deletePatient,
    softDeletePatient,
};
