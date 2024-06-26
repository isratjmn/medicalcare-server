"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_password_token: process.env.RESET_PASSWORD_TOKEN,
        passwordResetTokenExpirationTime: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    },
    reset_password_link: process.env.RESET_PASSWORD_LINK,
    bycrypt_salt_rounds: process.env.SALT_ROUND,
    emailSender: {
        email: process.env.EMAIL,
        app_password: process.env.APP_PASSWORD,
    },
    ssl: {
        store_id: process.env.STORE_ID,
        store_pass: process.env.STORE_PASS,
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        fail_url: process.env.FAIL_URL,
        ssl_payment_api: process.env.SSL_PAYMENT_API,
        ssl_validation_api: process.env.SSL_VALIDATION_API,
    },
};
