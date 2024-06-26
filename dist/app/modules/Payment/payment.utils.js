"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactionId = void 0;
const generateTransactionId = (userId) => {
    const userIdSuffix = userId.slice(-4);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const date = `${year}${month}${day}`;
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    const seconds = String(today.getSeconds()).padStart(2, "0");
    const time = `${hours}${minutes}${seconds}`;
    const transactionId = `${userIdSuffix}${date}${time}`;
    return transactionId;
};
exports.generateTransactionId = generateTransactionId;
