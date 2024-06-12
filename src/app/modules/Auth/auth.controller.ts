/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AuthService } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const loginUserFromDB = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.loginUser(req.body);
	const { refreshToken } = result;
	res.cookie("refreshToken", refreshToken, {
		secure: false,
		httpOnly: true,
	});
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Logged In Successfully !!",
		data: {
			accessToken: result.accessToken,
			needPasswordChange: result.needPasswordChange,
		},
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const { refreshToken } = req.cookies;
	const result = await AuthService.refreshToken(refreshToken);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Access Token Generated Successfully !!!",
		data: result,
	});
});

const changePassword = catchAsync(
	async (req: Request & { user?: any }, res: Response) => {
		const { user } = req;
		const payload = req.body;
		const result = await AuthService.changePassword(user, payload);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Change Password Successfully !!",
			data: result,
		});
	}
);

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
	await AuthService.forgotPassword(req.body.email);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Check Your Email Please!!",
	});
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const token = req.headers.authorization || "";
	await AuthService.resetPassword(req.body, token);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Account recovered!!",
	});
});

export const AuthController = {
	loginUserFromDB,
	refreshToken,
	changePassword,
	forgotPassword,
	resetPassword,
};
