import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { PrescriptionServices } from "./prescription.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";

const InsertPrescriptionIntoDB = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const result = await PrescriptionServices.InsertPrescription(
			user as IAuthUser,
			req.body
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Prescription Created Successfully...!!",
			data: result,
		});
	}
);

interface IPaginationOptions {
	limit: number;
	page: number;
	sortBy?: string;
	sortOrder?: string;
}

const patientPrescription = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user;
		const defaultOptions: IPaginationOptions = {
			limit: 10,
			page: 1,
		};
		const options = {
			...defaultOptions,
			...pick(req.query, ["limit", "page", "sortBy", "sortOrder"]),
		} as IPaginationOptions;

		const result = await PrescriptionServices.patientPrescription(
			user as IAuthUser,
			options
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "My Prescription Fetched Successfully...!!",
			meta: result.meta,
			data: result.data,
		});
	}
);
export const PrescriptionControllers = {
	InsertPrescriptionIntoDB,
	patientPrescription,
};
