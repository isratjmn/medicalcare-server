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
exports.ScheduleService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const date_fns_1 = require("date-fns");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const convertDateTime = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
});
const createScheduleIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate, startTime, endTime } = payload;
    const intervalTime = 30;
    const schedules = [];
    const currentDate = new Date(startDate); // Start Date
    const lastDate = new Date(endDate); // End Date
    while (currentDate <= lastDate) {
        const startDateTime = new Date((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(startTime.split(":")[0])));
        const endDateTime = new Date((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(endTime.split(":")[0])));
        while (startDateTime < endDateTime) {
            const startDate = yield convertDateTime(startDateTime);
            const endDate = yield convertDateTime((0, date_fns_1.addMinutes)(startDateTime, intervalTime));
            const scheduleData = {
                startDateTime: startDate,
                endDateTime: endDate,
            };
            const existingSchedule = yield prisma_1.default.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime,
                },
            });
            if (!existingSchedule) {
                const result = yield prisma_1.default.schedule.create({
                    data: scheduleData,
                });
                schedules.push(result);
            }
            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedules;
});
const getAllSchedule = (filters, options, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { startDate, endDate } = filters, filterData = __rest(filters, ["startDate", "endDate"]);
    const andConditions = [];
    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: startDate,
                    },
                },
                {
                    endDateTime: {
                        lte: endDate,
                    },
                },
            ],
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
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const doctorSchedules = yield prisma_1.default.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        },
    });
    const doctorScheduleIds = doctorSchedules.map((schedule) => schedule.scheduleId);
    const result = yield prisma_1.default.schedule.findMany({
        where: Object.assign(Object.assign({}, whereConditions), { id: {
                notIn: doctorScheduleIds,
            } }),
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
    });
    const total = yield prisma_1.default.schedule.count({
        where: Object.assign(Object.assign({}, whereConditions), { id: {
                notIn: doctorScheduleIds,
            } }),
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
const getScheduleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.schedule.findUnique({
        where: {
            id,
        },
    });
    // console.log(result?.startDateTime.getHours() + ":" + result?.startDateTime.getMinutes());
    return result;
});
exports.ScheduleService = {
    createScheduleIntoDB,
    getAllSchedule,
    getScheduleById,
};
