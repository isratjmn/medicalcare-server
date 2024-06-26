import {  PaymentStatus, UserRole } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";
import prisma from "../../../shared/prisma";

const fetchDashboardMetaData = async (user: IAuthUser) => {
	let metaData;
	switch (user?.role) {
		case UserRole.SUPER_ADMIN:
			metaData = getSuperAdminMetaData();
			break;
		case UserRole.ADMIN:
			metaData = getAdminMetaData();
			break;
		case UserRole.DOCTOR:
			metaData = getDoctorMetaData(user as IAuthUser);
			break;
		case UserRole.PATIENT:
			metaData = getPatientMetaData(user as IAuthUser);
			break;
		default:
			throw new Error("Invalid User Role...!");
	}
	return metaData;
};

const getSuperAdminMetaData = async () => {
	const appointmentCount = await prisma.appointment.count();
	const patientCount = await prisma.patient.count();
	const doctorCount = await prisma.doctor.count();
	const adminCount = await prisma.admin.count();
	const paymentCount = await prisma.patient.count();
	const totalRevenue = await prisma.payment.aggregate({
		_sum: { amount: true },
		where: {
			status: PaymentStatus.PAID,
		},
	});
	const barChartData = await getBarChatData();
	const pieChartData = await getPieChartData();
	return {
		appointmentCount,
		patientCount,
		doctorCount,
		adminCount,
		paymentCount,
		totalRevenue,
		barChartData,
		pieChartData,
	};
};

const getAdminMetaData = async () => {
	const appointmentCount = await prisma.appointment.count();
	const patientCount = await prisma.patient.count();
	const doctorCount = await prisma.doctor.count();
	const paymentCount = await prisma.patient.count();
	const totalRevenue = await prisma.payment.aggregate({
		_sum: { amount: true },
		where: {
			status: PaymentStatus.PAID,
		},
	});
	const barChartData = await getBarChatData();
	const pieChartData = await getPieChartData();
	return {
		appointmentCount,
		patientCount,
		doctorCount,
		paymentCount,
		totalRevenue,
		barChartData,
		pieChartData,
	};
};

const getDoctorMetaData = async (user: IAuthUser) => {
	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	});
	const appointmentCount = await prisma.appointment.count({
		where: {
			doctorId: doctorData.id,
		},
	});
	const patientCount = await prisma.appointment.groupBy({
		by: ["patientId"],
		_count: {
			id: true,
		},
	});
	const reviewCount = await prisma.review.count({
		where: {
			doctorId: doctorData.id,
		},
	});
	const totalRevenue = await prisma.payment.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			appointment: {
				doctorId: doctorData.id,
			},
			status: PaymentStatus.PAID,
		},
	});

	const appointmentStatusDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		_count: {
			id: true,
		},
		where: {
			doctorId: doctorData.id,
		},
	});
	const formattedAppointmentStatus = appointmentStatusDistribution.map(
		({ status, _count }) => ({
			status: status,
			count: Number(_count.id),
		})
	);
	return {
		appointmentCount,
		patientCount: patientCount.length,
		reviewCount,
		totalRevenue,
		formattedAppointmentStatus,
	};
};

const getPatientMetaData = async (user: IAuthUser) => {
	const patientData = await prisma.patient.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	});
	const appointmentCount = await prisma.appointment.count({
		where: {
			patientId: patientData.id,
		},
	});
	const prescriptionCount = await prisma.prescription.count({
		where: {
			patientId: patientData.id,
		},
	});
	const reviewCount = await prisma.review.count({
		where: {
			patientId: patientData.id,
		},
	});
	const appointmentStatusDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		_count: {
			id: true,
		},
		where: {
			patientId: patientData.id,
		},
	});
	const formattedAppointmentStatus = appointmentStatusDistribution.map(
		({ status, _count }) => ({
			status: status,
			count: Number(_count.id),
		})
	);
	return {
		appointmentCount,
		prescriptionCount,
		reviewCount,
		formattedAppointmentStatus,
	};
};

const getBarChatData = async () => {
	const appointmentCountByMonth = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count 
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `;
	return appointmentCountByMonth;
};

const getPieChartData = async () => {
	const appointmentStatusDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		_count: {
			id: true,
		},
	});
	const formattedAppointmentStatus = appointmentStatusDistribution.map(
		({ status, _count }) => ({
			status: status,
			count: Number(_count.id),
		})
	);
	return formattedAppointmentStatus;
};

export const MetaService = {
	fetchDashboardMetaData,
	getSuperAdminMetaData,
	getAdminMetaData,
	getDoctorMetaData,
	getPatientMetaData,
};
