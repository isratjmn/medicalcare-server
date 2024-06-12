/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import APIError from "../../errors/APIErrors";
import { IAuthUser } from "../../interfaces/common";

const patientReview = async (user: IAuthUser, payload: any) => {
	const patientData = await prisma.patient.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	});
	const appointmentData = await prisma.appointment.findUniqueOrThrow({
		where: {
			id: payload.appointmentId,
		},
	});
	if (!(patientData.id === appointmentData.patientId)) {
		throw new APIError(
			httpStatus.BAD_REQUEST,
			"This is Not your Apppoinment!!"
		);
	}
	return await prisma.$transaction(async (tx) => {
		const result = await tx.review.create({
			data: {
				appointmentId: appointmentData.id,
				doctorId: appointmentData.doctorId,
				patientId: appointmentData.patientId,
				rating: payload.rating,
				comment: payload.comment,
			},
		});
		const averageRating = await tx.review.aggregate({
			_avg: {
				rating: true,
			},
		});
		await tx.doctor.update({
			where: {
				id: result.doctorId,
			},
			data: {
				averageRating: averageRating._avg.rating as number,
			},
		});
		return result;
	});
};

const getAllReviews = async () => {
	const reviews = await prisma.review.findMany({});
	return reviews;
};

const getSingleReview = async (id: string) => {
	const result = prisma.review.findUniqueOrThrow({
		where: {
			id,
		},
		include: {
			patient: true,
			doctor: true,
			appointment: true,
		},
	});
	return result;
};

export const ReviewService = {
	patientReview,
	getAllReviews,
	getSingleReview,
};
