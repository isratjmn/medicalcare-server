import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { Request, Response } from "express";

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const { appointmentId } = req.params;
    const result = await PaymentService.initPayment(appointmentId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment Initiate Successfully !!",
        data: result
    });
});

export const PaymentController = {
    initPayment
};