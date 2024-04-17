import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHnadlers = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err?.message || "Something Went Wrong !!!";
    let error = err;

    if (err instanceof PrismaClientValidationError)
    {
        message = "Validation Error.....!!";
        error = err.message;
    } else if (err instanceof PrismaClientKnownRequestError)
    {
        if (err.code === "P2002")
        {
            message = "Duplicate Key Error";
            error = err.meta;

        }
    }

    res.status(statusCode).json({
        success,
        message,
        error
    });
};

export default globalErrorHnadlers;