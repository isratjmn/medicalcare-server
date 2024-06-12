import {
	AppointmentStatus,
	PaymentStatus,
	Prescription,
} from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import APIError from "../../errors/APIErrors";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";

const InsertPrescription = async (
	user: IAuthUser,
	payload: Partial<Prescription>
) => {
	const appointmentData = await prisma.appointment.findUniqueOrThrow({
		where: {
			id: payload.appointmentId,
			status: AppointmentStatus.COMPLETED,
			paymentStatus: PaymentStatus.PAID,
		},
		include: {
			doctor: true,
		},
	});
	if (!(user?.email === appointmentData.doctor.email)) {
		throw new APIError(
			httpStatus.BAD_REQUEST,
			"This is not your Appointment!!!"
		);
	}

	const result = await prisma.prescription.create({
		data: {
			appointmentId: appointmentData.id,
			doctorId: appointmentData.doctorId,
			patientId: appointmentData.patientId,
			instructions: payload.instructions as string,
			followUpDate: payload.followUpDate || undefined || null,
		},
		include: {
			doctor: true,
			patient: true,
		},
	});

	return result;
};

const patientPrescription = async (
	user: IAuthUser,
	options: IPaginationOptions
) => {
	const { limit, page, skip } = paginationHelper.calculatePagination(options);
	const result = await prisma.prescription.findMany({
		where: {
			patient: {
				email: user?.email,
			},
		},
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: { createdAt: "desc" },
		include: {
			doctor: true,
			patient: true,
			appointment: true,
		},
	});
	const total = await prisma.prescription.count({
		where: {
			patient: {
				email: user?.email,
			},
		},
	});
	return {
		meta: {
			total,
			page,
			limit,
		},
		data: {
			result,
		},
	};
};

export const PrescriptionServices = {
	InsertPrescription,
	patientPrescription,
};
