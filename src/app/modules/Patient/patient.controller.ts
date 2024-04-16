import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { PatientServices } from "./patient.service";
import pick from "../../../shared/pick";
import { patientFilterableFields } from "./patient.constant";


const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, patientFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await PatientServices.getAllPatient(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient Retrieval Successfully....!!',
        meta: result.meta,
        data: result.data,
    });
});


const getPatientById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const singlePatient = await PatientServices.singlePatientt(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single Patient Retrived Successfully...!!!",
        data: singlePatient
    });
}
);


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
    getAllFromDB,
    getPatientById,
    updateIntoDB,
    deleteFromDB,
    softDeletefromDB
};