import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { AppointmentService } from "./appointment.service";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";
import { appointmentFilterableFields } from "./appointment.constant";
import { IPaginationOptions } from "../../interfaces/pagination";

/* const createAppointment = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const result = await AppointmentService.createAppointment(
			user as IAuthUser,
			req.body
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Appointment Booked Successfully....!!",
			data: result,
		});
	}
); */

const createAppointment = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const result = await AppointmentService.createAppointment(
			req.body,
			user as IAuthUser
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Appointment booked successfully!",
			data: result,
		});
	}
);

interface IExtendedPaginationOptions extends IPaginationOptions {
	limit: number;
}

const getMyAppointment = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const filters = pick(req.query, appointmentFilterableFields);
		const options: IExtendedPaginationOptions = {
			limit: parseInt(req.query.limit as string, 10) || 10,
			page: parseInt(req.query.page as string, 10) || 1,
			sortBy: req.query.sortBy as string,
			sortOrder: req.query.sortOrder as string,
		};
		const user = req?.user;
		const result = await AppointmentService.getMyAppointmentIntoDB(
			filters,
			options,
			user as IAuthUser
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Appointment retrieval successfully..!",
			meta: result.meta,
			data: result.data,
		});
	}
);

/* const getMyAppointment = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const filters = pick(req.query, appointmentFilterableFields);
		const options = pick(req.query, [
			"limit",
			"page",
			"sortBy",
			"sortOrder",
		]);
		const user = req?.user;
		const result = await AppointmentService.getMyAppointmentIntoDB(
			filters,
			options,
			user as IAuthUser
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Appointment retrieval successfully",
			meta: result.meta,
			data: result.data,
		});
	}
); */

const changeAppointmentStatus = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const { id } = req.params;
		const { status } = req.body;
		const user = req.user;

		const result = await AppointmentService.changeAppointmentStatus(
			id,
			status,
			user as IAuthUser
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Appointment Status Changed Successfully....!!",
			data: result,
		});
	}
);

export const AppointmentController = {
	createAppointment,
	getMyAppointment,
	changeAppointmentStatus,
};
