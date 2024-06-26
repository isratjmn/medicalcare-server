import { Request, RequestHandler, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";

interface IPaginationOptions {
	limit: number;
	page: number;
	sortBy?: string;
	sortOrder?: string;
}

const getAllAdminsFromDB: RequestHandler = catchAsync(async (req, res) => {
	const filters = pick(req.query, adminFilterableFields);
	const defaultOptions: IPaginationOptions = {
		limit: 10,
		page: 1,
	};
	const options = {
		...defaultOptions,
		...pick(req.query, ["limit", "page", "sortBy", "sortOrder"]),
	} as IPaginationOptions;

	const result = await AdminService.getAllAdmin(filters, options);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admins Fetched Successfully !!!",
		meta: result.meta,
		data: result.data,
	});
});
const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await AdminService.getById(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admins Fetched Successfully by ID !!",
		data: result,
	});
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await AdminService.updateAdmin(id, req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin Data Updated Successfully !!!",
		data: result,
	});
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await AdminService.deleteAdmin(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin Data Deleted Successfully !!!",
		data: result,
	});
});

const softDeleted = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await AdminService.softDelete(id);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin Soft Deleted Successfully !!!",
		data: result,
	});
});

export const AdminController = {
	getAllAdminsFromDB,
	getByIdFromDB,
	updateIntoDB,
	deleteFromDB,
	softDeleted,
};
