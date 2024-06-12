import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DoctorServices } from "./doctor.service";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { doctorFilterableFields } from "./doctor.constant";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
	const filters = pick(req.query, doctorFilterableFields);
	const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
	const result = await DoctorServices.getAllDoctors(filters, options);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor Retrive Successfully !!",
		meta: result.meta,
		data: result.data,
	});
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await DoctorServices.getByIdFromDB(id);
	return sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor retrieved successfully!",
		data: result,
	});
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	const { ...doctorData } = payload;
	const result = await DoctorServices.updateIntoDB(id, doctorData);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor updated successfully",
		data: result,
	});
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await DoctorServices.deleteDoctor(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor Deleted Successfully !!!",
		data: result,
	});
});

const softDeletedFromBD = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await DoctorServices.softDelete(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor Soft Deleted Successfully....!",
		data: result,
	});
});

export const DoctorController = {
	getAllFromDB,
	getByIdFromDB,
	updateIntoDB,
	deleteFromDB,
	softDeletedFromBD,
};
