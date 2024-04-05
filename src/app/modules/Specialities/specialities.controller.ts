import { Request, Response } from "express";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SpecialitiesServices } from "./specialities.service";


const insertIntoDB = catchAsync(
    async (req: Request, res: Response) => {
        console.log(req.body);
        const result = await SpecialitiesServices.insertIntoDB(req);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Specialities Created Successfully!!",
            data: result
        });
    }
);

export const SpecialitiesController = {
    insertIntoDB
};