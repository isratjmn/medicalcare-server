import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { PatientServices } from "./patient.service";


const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await PatientServices.updatePatient(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient Updated Successfully...!!",
        data: result
    });
});


const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientServices.deletePatient(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient Deleted Successfully...!!",
        data: result
    });



});

const softDeletefromDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    const result = await PatientServices.softDeletePatient(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient Deleted Successfully...!!",
        data: result
    });

});


export const PatientControllers = {
    updateIntoDB,
    deleteFromDB, softDeletefromDB
};