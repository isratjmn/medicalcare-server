import { Request } from "express";
import { fileUploader } from "../../../helpers/FileUploader";
import prisma from "../../../shared/prisma";
import { Specialties } from "@prisma/client";
import { IUploadFile } from "../../interfaces/file";

const insertIntoDB = async (req: Request) => {
	const file = req.file as IUploadFile;
	if (file) {
		const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
		req.body.icon = uploadToCloudinary?.secure_url;
		const result = await prisma.specialties.create({
			data: req.body,
		});
		return result;
	}
};

const getAllFromDB = async (): Promise<Specialties[]> => {
	return await prisma.specialties.findMany();
};

const deleteFromDB = async (id: string): Promise<Specialties> => {
	const result = await prisma.specialties.delete({
		where: {
			id,
		},
	});
	return result;
};

export const SpecialitiesServices = {
	insertIntoDB,
	getAllFromDB,
	deleteFromDB,
};
