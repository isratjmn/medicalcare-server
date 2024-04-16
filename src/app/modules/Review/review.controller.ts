
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { Request, Response } from "express";
import { ReviewService } from "./review.service";

const reviewIntoDB = catchAsync(async (
    req: Request & { user?: IAuthUser; },
    res: Response) => {

    const user = req.user;
    const result = await ReviewService.patientReview(user as IAuthUser, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review Created Successfully...!!",
        data: result

    });
});


export const ReviewController = {
    reviewIntoDB
};