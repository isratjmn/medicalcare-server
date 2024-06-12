/* eslint-disable @typescript-eslint/no-explicit-any */
import { userSearchAbleFields } from "./user.constant";
import { Request } from "express";
import { Admin, Doctor, Prisma, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../helpers/FileUploader";
import { IUploadFile } from "../../interfaces/file";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";

import { hashedPassword } from "./user.utils";
import APIError from "../../errors/APIErrors";
import httpStatus from "http-status";

const createAdmin = async (req: Request): Promise<Admin> => {
	const file = req.file as IUploadFile;
	if (file) {
		const uploadResult = await fileUploader.uploadToCloudinary(file);
		// Assuming 'profilePhoto' is a field in the admin's data
		req.body.admin.profilePhoto = uploadResult?.secure_url;
	}
	const hasedPassword: string = await hashedPassword(req.body.password);
	const userData = {
		email: req.body.admin.email,
		password: hasedPassword,
		role: UserRole.ADMIN,
	};
	const result = await prisma.$transaction(async (transactionClient) => {
		await transactionClient.user.create({
			data: userData,
		});
		const createAdminData = await transactionClient.admin.create({
			data: req.body.admin,
		});
		return createAdminData;
	});
	return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
	const file = req.file as IUploadFile;

	if (file) {
		// If a file is uploaded, upload it to Cloudinary
		const uploadResult = await fileUploader.uploadToCloudinary(file);
		// Assuming 'profilePhoto' is a field in the admin's data
		req.body.doctor.profilePhoto = uploadResult?.secure_url;
	}
	const hasedPassword: string = await hashedPassword(req.body.password);

	const userData = {
		email: req.body.doctor.email,
		password: hasedPassword,
		role: UserRole.DOCTOR,
	};
	const result = await prisma.$transaction(async (transactionClient) => {
		await transactionClient.user.create({
			data: userData,
		});
		const createDoctorData = await transactionClient.doctor.create({
			data: req.body.doctor,
		});
		return createDoctorData;
	});
	return result;
};

const createPatient = async (req: Request) => {
	const file = req.file as IUploadFile;
	if (file) {
		const uploadResult = await fileUploader.uploadToCloudinary(file);
		req.body.patient.profilePhoto = uploadResult?.secure_url;
	}
	const hasedPassword: string = await hashedPassword(req.body.password);
	const userData = {
		email: req.body.patient.email,
		password: hasedPassword,
		role: UserRole.PATIENT,
	};
	const result = await prisma.$transaction(async (transactionClient) => {
		await transactionClient.user.create({
			data: userData,
		});
		const createPatientData = await transactionClient.patient.create({
			data: req.body.patient,
		});
		return createPatientData;
	});
	return result;
};


const getAllUser = async (options: IPaginationOptions, params: any) => {
	const { page, limit, skip } = paginationHelper.calculatePagination(options);
	const { searchTerm, ...filterData } = params;
	const andConditions: Prisma.UserWhereInput[] = [];
	// Handle search term
	if (searchTerm) {
		andConditions.push({
			OR: userSearchAbleFields.map((field) => ({
				[field]: {
					contains: searchTerm,
					mode: "insensitive",
				},
			})),
		});
	}
	// Handle filter data
	if (Object.keys(filterData).length > 0) {
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: (filterData as any)[key],
				},
			})),
		});
	}
	const whereConditions: Prisma.UserWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};
	const result = await prisma.user.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: undefined,
		select: {
			id: true,
			email: true,
			role: true,
			needPasswordChange: true,
			status: true,
			createdAt: true,
			updatedAt: true,
			admin: true,
			patient: true,
			doctor: true,
		},
	});
	const total = await prisma.user.count({
		where: whereConditions,
	});
	return {
		meta: {
			page,
			limit,
			total,
		},
		data: result,
	};
}


const changeProfileStatus = async (id: string, status: UserRole) => {
	await prisma.user.findUniqueOrThrow({
		where: {
			id,
		},
	});
	const updateuserStatus = await prisma.user.update({
		where: {
			id,
		},
		data: status,
	});
	return updateuserStatus;
};

const getMyProfile = async (authUser: any) => {
	const userData = await prisma.user.findUnique({
		where: {
			id: authUser.userId,
			status: UserStatus.ACTIVE,
		},
		select: {
			email: true,
			role: true,
			needPasswordChange: true,
			status: true,
		},
	});

	let profileData;
	if (userData?.role === UserRole.ADMIN) {
		profileData = await prisma.admin.findUnique({
			where: {
				email: userData.email,
			},
		});
	} else if (userData?.role === UserRole.DOCTOR) {
		profileData = await prisma.doctor.findUnique({
			where: {
				email: userData.email,
			},
		});
	} else if (userData?.role === UserRole.PATIENT) {
		profileData = await prisma.patient.findUnique({
			where: {
				email: userData.email,
			},
		});
	}
	return { ...profileData, ...userData };
};

const updateMyProfile = async (authUser: any, req: Request) => {
	const userData = await prisma.user.findUnique({
		where: {
			id: authUser.userId,
			status: UserStatus.ACTIVE,
		},
	});

	if (!userData) {
		throw new APIError(httpStatus.BAD_REQUEST, "User does not exists!");
	}

	const file = req.file as IUploadFile;

	if (file) {
		const uploadedProfileImage = await fileUploader.uploadToCloudinary(
			file
		);
		req.body.profilePhoto = uploadedProfileImage?.secure_url;
	}

	let profileData;

	if (userData?.role === UserRole.ADMIN) {
		profileData = await prisma.admin.update({
			where: {
				email: userData.email,
			},
			data: req.body,
		});
	} else if (userData?.role === UserRole.DOCTOR) {
		profileData = await prisma.doctor.update({
			where: {
				email: userData.email,
			},
			data: req.body,
		});
	} else if (userData?.role === UserRole.PATIENT) {
		profileData = await prisma.patient.update({
			where: {
				email: userData.email,
			},
			data: req.body,
		});
	}
	return { ...profileData, ...userData };
};

export const userService = {
	createAdmin,
	createDoctor,
	createPatient,
	getAllUser,
	changeProfileStatus,
	getMyProfile,
	updateMyProfile,
};
