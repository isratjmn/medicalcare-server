import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { MetaService } from "./meta.service";
import { IAuthUser } from "../../interfaces/common";


const fetchDashboardMetaData = catchAsync(
    async (req: Request & { user: IAuthUser; }, res: Response) => {
        const user = req.user;
        console.log(user);
        const result = await MetaService.fetchDashboardMetaData(user as IAuthUser);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Meta data Retrival Successfully .....!!",
            data: result
        });
    });

export const MetaController = {
    fetchDashboardMetaData
}

