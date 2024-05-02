import { Request, Response } from "express";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SpecialitiesServices } from "./specialities.service";


const insertIntoDB = catchAsync(
    async (req: Request, res: Response) => {

        const result = await SpecialitiesServices.insertIntoDB(req);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Specialities Created Successfully!!",
            data: result
        });
    }
);

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialitiesServices.getAllFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialties data fetched successfully',
        data: result,
    });
}
);

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SpecialitiesServices.deleteFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialty deleted successfully',
        data: result,
    });
});

export const SpecialitiesController = {
    insertIntoDB, getAllFromDB, deleteFromDB
};