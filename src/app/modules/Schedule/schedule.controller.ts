import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ScheduleService } from "./schedule.service";
import pick from "../../../shared/pick";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";

const createScheduleIntoDB = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.createScheduleIntoDB(req.body);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Schedule Created Successfully..!!",
		data: result,
	});
});

const getAllScheduleFromDB = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const filters = pick(req.query, ["startDate", "endDate"]);
		const options = pick(req.query, [
			"limit",
			"page",
			"sortBy",
			"sortOrder",
		]);
		const result = await ScheduleService.getAllSchedule(
			filters,
			options as unknown as IPaginationOptions,
			user as IAuthUser
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Schedule Fetched Successfully....!",
			data: result,
		});
	}
);

const getScheduleByIdFromDB = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const id = req.params.id;
		const result = await ScheduleService.getScheduleById(id);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Schedule Fetched Successfully by ID....!!!",
			data: result,
		});
	}
);

export const ScheduleController = {
	createScheduleIntoDB,
	getAllScheduleFromDB,
	getScheduleByIdFromDB,
};
