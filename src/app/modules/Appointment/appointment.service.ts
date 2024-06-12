/* eslint-disable @typescript-eslint/no-explicit-any */
import { Appointment, PaymentStatus } from "@prisma/client";
import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IAuthUser, IGenericResponse } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import APIError from "../../errors/APIErrors";
import httpStatus from "http-status";
import { generateTransactionId } from "../Payment/payment.utils";

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

const createAppointment = async (
	data: Partial<Appointment>,
	authUser: IAuthUser
) => {
	const { doctorId, scheduleId } = data;
	const isDoctorExists = await prisma.doctor.findFirst({
		where: {
			id: doctorId,
		},
	});
	if (!isDoctorExists) {
		throw new APIError(httpStatus.BAD_REQUEST, "Doctor doesn't exists!");
	}
	const isPatientExists = await prisma.patient.findFirst({
		where: {
			email: authUser?.email,
		},
	});
	if (!isPatientExists) {
		throw new APIError(httpStatus.BAD_REQUEST, "Patient doesn't exists!");
	}
	const isExistsDoctorSchedule = await prisma.doctorSchedules.findFirst({
		where: {
			doctorId: doctorId,
			scheduleId: scheduleId,
			isBooked: false,
		},
	});
	if (!isExistsDoctorSchedule) {
		throw new APIError(
			httpStatus.BAD_REQUEST,
			"Doctor Schedule is not available!"
		);
	}
	const videoCallingId: string = uuidv4();
	return await prisma.$transaction(async (transactionClient) => {
		const result = await transactionClient.appointment.create({
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
		await transactionClient.doctorSchedules.updateMany({
			where: {
				doctorId: isDoctorExists.id,
				scheduleId: isExistsDoctorSchedule.scheduleId,
			},
			data: {
				isBooked: true,
				appointmentId: result.id,
			},
		});
		const transactionId: string = generateTransactionId(result.id);
		await transactionClient.payment.create({
			data: {
				appointmentId: result.id,
				amount: result.doctor.appintmentFee,
				transactionId,
			},
		});
		return result;
	});
};

const getMyAppointmentIntoDB = async (
	filters: any,
	options: IPaginationOptions,
	authUser: IAuthUser
): Promise<IGenericResponse<Appointment[]>> => {
	const { limit, page, skip } = paginationHelper.calculatePagination(options);
	const andConditions = [];

	if (authUser?.role === UserRole.PATIENT) {
		andConditions.push({
			patient: {
				email: authUser?.email,
			},
		});
	} else {
		andConditions.push({
			doctor: {
				email: authUser?.email,
			},
		});
	}
	if (Object.keys(filters).length > 0) {
		andConditions.push({
			AND: Object.keys(filters).map((key) => ({
				[key]: {
					equals: (filters as any)[key],
				},
			})),
		});
	}
	const whereConditions: Prisma.AppointmentWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};
	const result = await prisma.appointment.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: { createdAt: "desc" },
		include:
			authUser?.role === UserRole.PATIENT
				? { doctor: true, schedule: true }
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
	const total = await prisma.appointment.count({
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
};

const changeAppointmentStatus = async (
	appointmentId: string,
	status: AppointmentStatus,
	user: IAuthUser
) => {
	const appointmentData = await prisma.appointment.findUnique({
		where: {
			id: appointmentId,
		},
		include: {
			doctor: true,
		},
	});

	if (user?.role === UserRole.DOCTOR) {
		if (!(user.email === appointmentData?.doctor.email)) {
			throw new APIError(
				httpStatus.BAD_REQUEST,
				"This is not your Appointment !!"
			);
		}
	}

	const result = await prisma.appointment.update({
		where: {
			id: appointmentId,
		},
		data: {
			status,
		},
	});
	return result;
};

const cancelUnpaidAppointments = async () => {
	const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
	const unPaidAppointments = await prisma.appointment.findMany({
		where: {
			createdAt: {
				lte: thirtyMinAgo,
			},
			paymentStatus: PaymentStatus.UNPAID,
		},
	});

	const appointmentIdsToCancel = unPaidAppointments.map(
		(appointment) => appointment.id
	);

	await prisma.$transaction(async (tx) => {
		await tx.payment.deleteMany({
			where: {
				appointmentId: {
					in: appointmentIdsToCancel,
				},
			},
		});
		await tx.appointment.deleteMany({
			where: {
				id: {
					in: appointmentIdsToCancel,
				},
			},
		});

		for (const unPaidAppointment of unPaidAppointments) {
			await tx.doctorSchedules.updateMany({
				where: {
					doctorId: unPaidAppointment.doctorId,
					scheduleId: unPaidAppointment.scheduleId,
				},
				data: {
					isBooked: false,
				},
			});
		}
	});
};

export const AppointmentService = {
	createAppointment,
	getMyAppointmentIntoDB,
	changeAppointmentStatus,
	cancelUnpaidAppointments,
};
