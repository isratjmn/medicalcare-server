import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { AppointmentService } from "./appointment.service";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";


const createAppointment = catchAsync(
    async (req: Request & { user?: IAuthUser; }, res: Response) => {
        const user = req.user;
        const result = await AppointmentService.createAppointment(user as IAuthUser, req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Appointment Booked Successfully....!!",
            data: result
        });
    });

const getMyAppointment = catchAsync(
    async (req: Request & { user?: IAuthUser; }, res: Response) => {

        const user = req.user;
        const filters = pick(req.query, ["status", "paymentStatus"]);

        const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
        const result = await AppointmentService.getMyAppointmentIntoDB(user as IAuthUser, filters, options);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "My Appointment Retrive Successfully....!!",
            data: result
        });
    });

const changeAppointmentStatus = catchAsync(
    async (req: Request & { user?: IAuthUser; }, res: Response) => {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;

        const result = await AppointmentService.changeAppointmentStatus(id, status, user as IAuthUser);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Appointment Status Changed Successfully....!!",
            data: result
        });
    }
);

export const AppointmentController = {
    createAppointment,
    getMyAppointment,
    changeAppointmentStatus
};
