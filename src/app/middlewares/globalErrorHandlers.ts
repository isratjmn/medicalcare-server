import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHnadlers = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err?.message || "Something Went Wrong !!!",
        error: err
    });
};

export default globalErrorHnadlers;