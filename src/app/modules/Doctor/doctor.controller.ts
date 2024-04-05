
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DoctorServices } from "./doctor.service";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { doctorFilterableFields, doctorSearchableFields } from "./doctor.constant";


const getAllFromDB = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(
            req.query, doctorFilterableFields
        );
        const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
        const result = await DoctorServices.getAllDoctors(filters, options);
        sendResponse(
            res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Doctor Retrive Successfully !!",
            meta: result.meta,
            data: result.data
        });
    }
);

const updateIntoDB = catchAsync(
    async (req, res) => {
        const { id } = req.params;
        const result = await DoctorServices.updateIntoDB(id, req.body);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Doctor Data is Updated!!!",
            data: result
        });
    });

export const DoctorController = {
    getAllFromDB,
    updateIntoDB
};