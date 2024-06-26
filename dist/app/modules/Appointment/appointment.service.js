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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const uuid_1 = require("uuid");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const APIErrors_1 = __importDefault(require("../../errors/APIErrors"));
const http_status_1 = __importDefault(require("http-status"));
const payment_utils_1 = require("../Payment/payment.utils");
// const createAppointment = async (user: IAuthUser, payload: any) => {
// 	const patientData = await prisma.patient.findUniqueOrThrow({
// 		where: {
// 			email: user?.email,
// 		},
// 	});
// 	const doctorData = await prisma.doctor.findUniqueOrThrow({
// 		where: {
// 			id: payload.doctorId,
// 		},
// 	});
// 	const doctorScheduleData = await prisma.doctorSchedules.findFirstOrThrow({
// 		where: {
// 			doctorId: doctorData.id,
// 			scheduleId: payload.scheduleId,
// 			isBooked: false,
// 		},
// 	});
// 	const videoCallingId: string = uuidv4();
// 	const result = await prisma.$transaction(async (tx) => {
// 		const appointmentData = await tx.appointment.create({
// 			data: {
// 				patientId: patientData.id,
// 				doctorId: doctorData.id,
// 				scheduleId: payload.scheduleId,
// 				videoCallingId,
// 			},
// 			include: {
// 				patient: true,
// 				doctor: true,
// 				schedule: true,
// 			},
// 		});
// 		await tx.doctorSchedules.update({
// 			where: {
// 				doctorId_scheduleId: {
// 					doctorId: doctorData.id,
// 					scheduleId: payload.scheduleId,
// 				},
// 			},
// 			data: {
// 				isBooked: true,
// 				appointmentId: appointmentData.id,
// 			},
// 		});
// 		// PH-Medical-Care-dateTime
// 		const today = new Date();
// 		// const transactionId = `PH-Medical-Care-${today.getFullYear()}-${uuidv4()}`;
// 		// Generate a shorter transaction ID
// 		const transactionId = `PH-${shortid.generate()}`;
// 		await tx.payment.create({
// 			data: {
// 				appointmentId: appointmentData.id,
// 				amount: doctorData.appintmentFee,
// 				transactionId,
// 			},
// 		});
// 		return appointmentData;
// 	});
// 	return result;
// };
// const getMyAppointmentIntoDB = async (
// 	user: IAuthUser,
// 	filters: any,
// 	options: IPaginationOptions
// ) => {
// 	const { limit, page, skip } = paginationHelper.calculatePagination(options);
// 	const { ...filterData } = filters;
// 	const andConditions: Prisma.AppointmentWhereInput[] = [];
// 	if (user?.role === UserRole.PATIENT) {
// 		andConditions.push({
// 			patient: {
// 				email: user?.email,
// 			},
// 		});
// 	} else if (user?.role === UserRole.DOCTOR) {
// 		andConditions.push({
// 			doctor: {
// 				email: user?.email,
// 			},
// 		});
// 	}
// 	if (Object.keys(filterData).length > 0) {
// 		const filterConditions = Object.keys(filterData).map((key) => ({
// 			[key]: {
// 				equals: (filterData as any)[key],
// 			},
// 		}));
// 		andConditions.push(...filterConditions);
// 	}
// 	const whereConditions: Prisma.AppointmentWhereInput =
// 		andConditions.length > 0
// 			? {
// 					AND: andConditions,
// 			}
// 			: {};
// 	const result = await prisma.appointment.findMany({
// 		where: whereConditions,
// 		skip,
// 		take: limit,
// 		orderBy:
// 			options.sortBy && options.sortOrder
// 				? {
// 						[options.sortBy]: options.sortOrder,
// 				}
// 				: { createdAt: "desc" },
// 		include:
// 			user?.role === UserRole.PATIENT
// 				? {
// 						doctor: true,
// 						schedule: true,
// 				}
// 				: {
// 						patient: {
// 							include: {
// 								medicalReport: true,
// 								patienthealthData: true,
// 							},
// 						},
// 						schedule: true,
// 				},
// 	});
// 	const total = await prisma.appointment.count({
// 		where: whereConditions,
// 	});
// 	return {
// 		meta: {
// 			total,
// 			page,
// 			limit,
// 		},
// 		data: result,
// 	};
// };
const createAppointment = (data, authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { doctorId, scheduleId } = data;
    const isDoctorExists = yield prisma_1.default.doctor.findFirst({
        where: {
            id: doctorId,
        },
    });
    if (!isDoctorExists) {
        throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "Doctor doesn't exists!");
    }
    const isPatientExists = yield prisma_1.default.patient.findFirst({
        where: {
            email: authUser === null || authUser === void 0 ? void 0 : authUser.email,
        },
    });
    if (!isPatientExists) {
        throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "Patient doesn't exists!");
    }
    const isExistsDoctorSchedule = yield prisma_1.default.doctorSchedules.findFirst({
        where: {
            doctorId: doctorId,
            scheduleId: scheduleId,
            isBooked: false,
        },
    });
    if (!isExistsDoctorSchedule) {
        throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "Doctor Schedule is not available!");
    }
    const videoCallingId = (0, uuid_1.v4)();
    return yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield transactionClient.appointment.create({
            data: {
                patientId: isPatientExists.id,
                doctorId: isDoctorExists.id,
                scheduleId: isExistsDoctorSchedule.scheduleId,
                videoCallingId,
            },
            include: {
                doctor: true,
                schedule: true,
            },
        });
        yield transactionClient.doctorSchedules.updateMany({
            where: {
                doctorId: isDoctorExists.id,
                scheduleId: isExistsDoctorSchedule.scheduleId,
            },
            data: {
                isBooked: true,
                appointmentId: result.id,
            },
        });
        const transactionId = (0, payment_utils_1.generateTransactionId)(result.id);
        yield transactionClient.payment.create({
            data: {
                appointmentId: result.id,
                amount: result.doctor.appintmentFee,
                transactionId,
            },
        });
        return result;
    }));
});
const getMyAppointmentIntoDB = (filters, options, authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if ((authUser === null || authUser === void 0 ? void 0 : authUser.role) === client_2.UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: authUser === null || authUser === void 0 ? void 0 : authUser.email,
            },
        });
    }
    else {
        andConditions.push({
            doctor: {
                email: authUser === null || authUser === void 0 ? void 0 : authUser.email,
            },
        });
    }
    if (Object.keys(filters).length > 0) {
        andConditions.push({
            AND: Object.keys(filters).map((key) => ({
                [key]: {
                    equals: filters[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
        include: (authUser === null || authUser === void 0 ? void 0 : authUser.role) === client_2.UserRole.PATIENT
            ? { doctor: true, schedule: true, patient: true }
            : {
                patient: {
                    include: {
                        medicalReport: true,
                        prescription: true,
                    },
                },
                schedule: true,
            },
    });
    const total = yield prisma_1.default.appointment.count({
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
const changeAppointmentStatus = (appointmentId, status, user) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentData = yield prisma_1.default.appointment.findUnique({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true,
        },
    });
    if ((user === null || user === void 0 ? void 0 : user.role) === client_2.UserRole.DOCTOR) {
        if (!(user.email === (appointmentData === null || appointmentData === void 0 ? void 0 : appointmentData.doctor.email))) {
            throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "This is not your Appointment !!");
        }
    }
    const result = yield prisma_1.default.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status,
        },
    });
    return result;
});
const cancelUnpaidAppointments = () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const unPaidAppointments = yield prisma_1.default.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo,
            },
            paymentStatus: client_1.PaymentStatus.UNPAID,
        },
    });
    const appointmentIdsToCancel = unPaidAppointments.map((appointment) => appointment.id);
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel,
                },
            },
        });
        yield tx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel,
                },
            },
        });
        for (const unPaidAppointment of unPaidAppointments) {
            yield tx.doctorSchedules.updateMany({
                where: {
                    doctorId: unPaidAppointment.doctorId,
                    scheduleId: unPaidAppointment.scheduleId,
                },
                data: {
                    isBooked: false,
                },
            });
        }
    }));
});
exports.AppointmentService = {
    createAppointment,
    getMyAppointmentIntoDB,
    changeAppointmentStatus,
    cancelUnpaidAppointments,
};
