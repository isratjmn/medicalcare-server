import { Secret } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import prisma from "../../../shared/prisma";
import { JWTHelpers } from '../../../helpers/JWTHelpers';
import { UserStatus } from '@prisma/client';
import config from '../../../config';
import emailSender from './emailSender';
import { userService } from '../User/user.service';
import APIError from '../../errors/APIErrors';
import httpStatus from 'http-status';


const loginUser = async (payload: {
    email: string, password: string;
}) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });
    const isCorrectPassword: boolean = await bcrypt.compare(payload.password, userData.password);
    if (!isCorrectPassword)
    {
        throw new Error("Password Incrrect");
    }
    const accessToken = JWTHelpers.generateToken(
        {
            email: userData.email,
            role: userData.role
        },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );
    const refreshToken = JWTHelpers.generateToken(
        {
            email: userData.email,
            role: userData.role
        },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string
    );
    return {
        accessToken, refreshToken, needPasswordChange: userData.needPasswordChange
    };
};

const refreshToken = async (token: string) => {
    let decodedData;
    try
    {
        decodedData = JWTHelpers.verifyToken(token, config.jwt.refresh_token_secret as Secret);
    } catch (err)
    {
        throw new Error('You are not Authorized !!');
    }
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    });
    const accessToken = JWTHelpers.generateToken(
        {
            email: userData.email,
            role: userData.role
        },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );
    return {
        accessToken, needPasswordChange: userData.needPasswordChange
    };
};


const changePassword = async (user: any, payload: any) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        }
    });
    if (!userData)
    {
        throw new Error("User not found");
    }
    const isCorrectPassword: boolean = await bcrypt.compare
        (payload.oldPassword, userData.password);
    if (!isCorrectPassword)
    {
        throw new Error("Password Incrrect");
    }
    // const hasedPassword: string = await bcrypt.hash(payload.newPassword, 8);
    const salt = await bcrypt.genSalt(10);
    // Hash the new password using the generated salt
    const hashedPassword = await bcrypt.hash(payload.newPassword, salt);
    await prisma.user.update({
        where: {
            email: userData.email
        }, data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    });
    return {
        message: "Password Changed Successfully !!!!"
    };
};

const forgotPassword = async (payload: {
    email: string;

}) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });

    const resetPassToken = JWTHelpers.generateToken({
        email: userData.email,
        role: userData.role
    },
        config.jwt.reset_password_token as Secret,
        config.jwt.reset_pass_token_expires_in as string
    );

    const resetPasswordLink = config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;
    await emailSender(
        userData.email,
        `<div>
            <p>Dear User,</p>
            <p>You have requested to reset your password. Please click the following link to reset your password:</p>
                <a href="${resetPasswordLink}" style="text-decoration: none;">
                    <button style="background-color: #4CAF50; /* Green */
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;">
                        Reset Password
                    </button>
                </a>
            <p>Regards,</p>
            <p>PH-Health Care</p>
            
        <div/>`
    );
};

const resetPassword = async (token: string, payload: {
    id: string,
    password: string;

}) => {

    const userdata = await prisma.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            status: UserStatus.ACTIVE
        }
    });
    const isValidToken = JWTHelpers.verifyToken(
        token,
        config.jwt.refresh_token_secret as Secret
    );
    if (isValidToken)
    {
        throw new APIError(httpStatus.FORBIDDEN, "FORBIDDEN!!");
    }

    // Hash Password
    const password = await bcrypt.hash(payload.password, 12);

    // Update into database
    await prisma.user.update({
        where: {
            id: payload.id
        },
        data: {
            password
        }
    });


};

export const AuthService = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword
};


