/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, DoctorSchedules } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { IAuthUser, IGenericResponse } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import APIError from "../../errors/APIErrors";
import httpStatus from "http-status";
import { IDoctorScheduleFilterRequest } from "./doctorSchedule.interface";

const getAllDoctorSchedule = async (
	filters: IDoctorScheduleFilterRequest,
	options: IPaginationOptions
): Promise<IGenericResponse<DoctorSchedules[]>> => {
	const { limit, page, skip } = paginationHelper.calculatePagination(options);
	const { searchTerm, ...filterData } = filters;
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
		if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "true"
		) {
			filterData.isBooked = true;
		} else if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "false"
		) {
			filterData.isBooked = false;
		}
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: (filterData as any)[key],
				},
			})),
		});
	}

	const whereConditions: any =
		andConditions.length > 0 ? { AND: andConditions } : {};
	const result = await prisma.doctorSchedules.findMany({
		include: {
			doctor: true,
			schedule: true,
		},
		where: whereConditions,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: {
						// createdAt: 'desc',
				},
	});
	const total = await prisma.doctorSchedules.count({
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

const createDSIntoDB = async (
	user: any,
	payload: {
		scheduleIds: string[];
	}
) => {
	const doctorData = await prisma.doctor.findUniqueOrThrow({
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
	const result = await prisma.doctorSchedules.createMany({
		data: doctorScheduleData,
	});
	return result;
};

const getMyDSIntoDB = async (filters: any, options: IPaginationOptions) => {
	const { limit, page, skip } = paginationHelper.calculatePagination(options);
	const { startDate, endDate, ...filterData } = filters;

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
		if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "true"
		) {
			filterData.isBooked = true;
		} else if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "false"
		) {
			filterData.isBooked = false;
		}
		andConditions.push({
			AND: Object.keys(filterData).map((key) => {
				return {
					[key]: {
						equals: (filterData as any)[key],
					},
				};
			}),
		});
	}
	const whereConditions: Prisma.DoctorSchedulesWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};
	const result = await prisma.doctorSchedules.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: {},
	});
	const total = await prisma.doctorSchedules.count({
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

const deleteFromDB = async (user: IAuthUser, scheduleId: string) => {
	const doctorData = await prisma.doctor.findUnique({
		where: {
			email: user?.email,
		},
	});

	if (!doctorData) {
		throw new APIError(httpStatus.NOT_FOUND, "Doctor not found.");
	}
	const isBookedSchedule = await prisma.doctorSchedules.findFirst({
		where: {
			doctorId: doctorData.id,
			scheduleId: scheduleId,
			isBooked: true,
		},
	});

	if (isBookedSchedule) {
		throw new APIError(
			httpStatus.BAD_REQUEST,
			"You cannot delete the schedule because it is already booked."
		);
	}
	await prisma.doctorSchedules.delete({
		where: {
			doctorId_scheduleId: {
				doctorId: doctorData.id,
				scheduleId: scheduleId,
			},
		},
	});

	return null;
};

export const doctorScheduleService = {
	getAllDoctorSchedule,
	createDSIntoDB,
	getMyDSIntoDB,
	deleteFromDB,
};
