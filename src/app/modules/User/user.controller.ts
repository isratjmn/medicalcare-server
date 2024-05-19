// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Request, Response } from "express";
import { userService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { UserFilterableFields } from "./user.constant";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { IAuthUser } from "../../interfaces/common";

const createAdmin = catchAsync(
	async (req: Request, res: Response) => {
		const result = await userService.createAdmin(req);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Admin Created Successfully!!",
			data: result,
		});
	}
);

const createDoctor = catchAsync(
	async (req: Request, res: Response) => {
		const result = await userService.createDoctor(req);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Doctor Created Successfully!!",
			data: result,
		});
	});

const createPatient = catchAsync(
	async (req: Request, res: Response) => {
		const result = await userService.createPatient(req);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Patient Created Successfully!!",
			data: result,
		});
	});


const getAllFromDB = catchAsync(
	async (req: Request, res: Response) => {
		const filters = pick(req.query, UserFilterableFields);
		const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
		const result = await userService.getAllUser(options, filters);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "User Data Fetched Successfully!!",
			meta: result.meta,
			data: result.data
		}
		);
	}
);


const changeProfileStatus = catchAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id;

		const result = await userService.changeProfileStatus(id, req.body);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "User Data Fetched Successfully!!",
			data: result
		}
		);
	}
);
/* 
const getMyProfile = catchAsync(
	async (req: Request & { user?: IAuthUser; }, res: Response) => {
		const user = req.user;
		const result = await userService.getMyProfile(user as IAuthUser);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "My Profile Data Fetched Successfully!!",
			data: result
		}
		);
	}
); */

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const result = await userService.getMyProfile(user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Profile data fetched!',
		data: result
	});
});

/* const updateMyProfile = catchAsync(
	async (req: Request & { user?: IAuthUser; }, res: Response) => {
		const user = req.user;
		const result = await userService.updateMyProfile(user as IAuthUser, req);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "My Profile Data Updated Successfully!!",
			data: result
		}
		);
	}
); */

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;

	const result = await userService.updateMyProfile(user, req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Profile data fetched!',
		data: result
	});
});

export const userController = {
	createAdmin,
	createDoctor,
	createPatient,
	getAllFromDB,
	changeProfileStatus,
	getMyProfile,
	updateMyProfile
};
