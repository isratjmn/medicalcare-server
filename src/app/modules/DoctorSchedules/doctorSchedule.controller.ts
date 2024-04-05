import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { doctorScheduleService } from "./doctorSchedule.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";
import { IPaginationOptions } from "../../interfaces/pagination";


const createDoctorSchedule = catchAsync(
    async (req: Request & { user?: IAuthUser; }, res: Response) => {
        const user = req.user;
        const result = await doctorScheduleService.createDSIntoDB(user, req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Doctor Schedule Created Successfully ....!!!",
            data: result
        });
    }
);


const getMyDoctorSchedule = catchAsync(
    async (req: Request & { user?: IAuthUser; }, res: Response) => {
        const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
        const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
        const user = req.user;
        const result = await doctorScheduleService.getMyDSIntoDB(filters, options as unknown as IPaginationOptions, user as IAuthUser);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Doctor Schedule Retrive Successfully ....!!!",
            data: result
        });
    });


const deleteMyDoctorSchedule = catchAsync(
    async (req: Request & { user?: IAuthUser; }, res: Response) => {

        const user = req.user;
        const result = await doctorScheduleService.deleteFromDB();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "My Doctor Schedule Deleted Successfully ....!!!",
            data: result
        });
    });


export const doctorScheduleController = {
    createDoctorSchedule,
    getMyDoctorSchedule,
    deleteMyDoctorSchedule
};