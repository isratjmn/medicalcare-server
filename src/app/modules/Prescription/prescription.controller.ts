import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { PrescriptionServices } from "./prescription.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { IAuthUser } from "../../interfaces/common";


const InsertPrescriptionIntoDB = catchAsync(async (req: Request & { user?: IAuthUser; }, res: Response) => {
    const user = req.user;
    const result = await PrescriptionServices.InsertPrescription(user as IAuthUser, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Prescription Created Successfully...!!",
        data: result

    });

});


export const PrescriptionControllers = {
    InsertPrescriptionIntoDB
};