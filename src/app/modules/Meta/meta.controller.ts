import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { MetaService } from "./meta.service";
import { IAuthUser } from "../../interfaces/common";

interface AuthenticatedRequest extends Request {
	user: IAuthUser;
}

const fetchDashboardMetaData = catchAsync(
	async (req: Request, res: Response) => {
		const user = (req as AuthenticatedRequest).user;
		const result = await MetaService.fetchDashboardMetaData(user);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Meta data Retrieval Successfully .....!!",
			data: result,
		});
	}
);
export const MetaController = {
	fetchDashboardMetaData,
};
