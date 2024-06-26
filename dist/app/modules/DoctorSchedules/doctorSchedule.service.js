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
exports.doctorScheduleService = void 0;
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const APIErrors_1 = __importDefault(require("../../errors/APIErrors"));
const http_status_1 = __importDefault(require("http-status"));
const getAllDoctorSchedule = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            doctor: {
                name: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === "string" &&
            filterData.isBooked === "true") {
            filterData.isBooked = true;
        }
        else if (typeof filterData.isBooked === "string" &&
            filterData.isBooked === "false") {
            filterData.isBooked = false;
        }
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.doctorSchedules.findMany({
        include: {
            doctor: true,
            schedule: true,
        },
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
            // createdAt: 'desc',
            },
    });
    const total = yield prisma_1.default.doctorSchedules.count({
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
const createDSIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    if (!doctorData) {
        throw new Error("Doctor not found");
    }
    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
        doctorId: doctorData.id,
        scheduleId,
        isBooked: false,
    }));
    const result = yield prisma_1.default.doctorSchedules.createMany({
        data: doctorScheduleData,
    });
    return result;
});
const getMyDSIntoDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { startDate, endDate } = filters, filterData = __rest(filters, ["startDate", "endDate"]);
    const andConditions = [];
    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    schedule: {
                        startDateTime: {
                            gte: startDate,
                        },
                    },
                },
                {
                    schedule: {
                        endDateTime: {
                            lte: endDate,
                        },
                    },
                },
            ],
        });
    }
    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === "string" &&
            filterData.isBooked === "true") {
            filterData.isBooked = true;
        }
        else if (typeof filterData.isBooked === "string" &&
            filterData.isBooked === "false") {
            filterData.isBooked = false;
        }
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
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.doctorSchedules.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {},
    });
    const total = yield prisma_1.default.doctorSchedules.count({
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
const deleteFromDB = (user, scheduleId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the doctor data based on the user's email
    const doctorData = yield prisma_1.default.doctor.findUnique({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    if (!doctorData) {
        throw new APIErrors_1.default(http_status_1.default.NOT_FOUND, "Doctor not found.");
    }
    // Check if the schedule is already booked
    const isBookedSchedule = yield prisma_1.default.doctorSchedules.findFirst({
        where: {
            doctorId: doctorData.id,
            scheduleId: scheduleId,
            isBooked: true,
        },
    });
    if (isBookedSchedule) {
        throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "You cannot delete the schedule because it is already booked.");
    }
    // Delete the schedule
    yield prisma_1.default.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleId,
            },
        },
    });
    return null;
});
exports.doctorScheduleService = {
    getAllDoctorSchedule,
    createDSIntoDB,
    getMyDSIntoDB,
    deleteFromDB,
};
