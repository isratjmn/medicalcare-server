import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { doctorScheduleService } from "./doctorSchedule.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";
import { scheduleFilterableFields } from "./doctorSchedule.constants";

interface IPaginationOptions {
	limit: number;
	page: number;
	sortBy?: string;
	sortOrder?: string;
}

const getAllDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
	const filters = pick(req.query, scheduleFilterableFields);
	const defaultOptions: IPaginationOptions = {
		limit: 10, 
		page: 1, 
	};
	const options = {
		...defaultOptions,
		...pick(req.query, ["limit", "page", "sortBy", "sortOrder"]),
	} as IPaginationOptions;
	const result = await doctorScheduleService.getAllDoctorSchedule(
		filters,
		options
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor Schedule retrieval successfully",
		meta: result.meta,
		data: result.data,
	});
});

const createDoctorSchedule = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const result = await doctorScheduleService.createDSIntoDB(
			user,
			req.body
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Doctor Schedule Created Successfully ....!!!",
			data: result,
		});
	}
);

const getMyDoctorSchedule = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
		const options = pick(req.query, [
			"limit",
			"page",
			"sortBy",
			"sortOrder",
		]);
		const user = req.user;
		const result = await doctorScheduleService.getMyDSIntoDB(
			filters,
			options as unknown as IPaginationOptions,
			user as IAuthUser
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Doctor Schedule Retrive Successfully ....!!!",
			data: result,
		});
	}
);

const deleteMyDoctorSchedule = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const { id } = req.params;

		const result = await doctorScheduleService.deleteFromDB(
			user as IAuthUser,
			id
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "My Doctor Schedule Deleted Successfully ....!!!",
			data: result,
		});
	}
);

export const doctorScheduleController = {
	getAllDoctorSchedule,
	createDoctorSchedule,
	getMyDoctorSchedule,
	deleteMyDoctorSchedule,
};
