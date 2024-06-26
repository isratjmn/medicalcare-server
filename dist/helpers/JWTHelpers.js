"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTHelpers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const generateToken = (payload, secret, expiresIn) => {
    const token = jsonwebtoken_1.default.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn,
    });
    return token;
};
const verifyToken = (token, secret) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
const createPasswordResetToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.jwt_secret, {
        algorithm: "HS256",
        expiresIn: config_1.default.jwt.passwordResetTokenExpirationTime,
    });
};
exports.JWTHelpers = {
    generateToken,
    verifyToken,
    createPasswordResetToken,
};
