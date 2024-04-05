import { NextFunction, Request, Response } from "express";
import { JWTHelpers } from "../../helpers/JWTHelpers";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import APIError from "../errors/APIErrors";
import httpStatus from "http-status";

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any; }, res: Response, next: NextFunction) => {
        try
        {
            const token = req.headers.authorization;
            if (!token)
            {
                throw new APIError(httpStatus.UNAUTHORIZED, 'You are not Authorized');
            }
            const verifiedUser = JWTHelpers.verifyToken(token, config.jwt.jwt_secret as Secret);

            req.user = verifiedUser;

            if (!roles.length && !roles.includes(verifiedUser.role))
            {
                throw new APIError(httpStatus.FORBIDDEN, 'Forbuidden !!!');
            }
            next();
        } catch (err)
        {
            next(err);
        }
    };
};

export default auth;