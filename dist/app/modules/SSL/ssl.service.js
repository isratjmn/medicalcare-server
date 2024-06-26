"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
const APIErrors_1 = __importDefault(require("../../errors/APIErrors"));
const http_status_1 = __importDefault(require("http-status"));
const initPayment = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            store_id: config_1.default.ssl.store_id,
            store_passwd: config_1.default.ssl.store_pass,
            total_amount: paymentData === null || paymentData === void 0 ? void 0 : paymentData.amount,
            currency: "BDT",
            tran_id: paymentData.transactionId,
            success_url: config_1.default.ssl.success_url,
            cancel_url: config_1.default.ssl.cancel_url,
            fail_url: config_1.default.ssl.fail_url,
            ipn_url: "http://localhost:3030/ipn",
            shipping_method: "N/A",
            product_name: "Appointment",
            product_category: "Service",
            product_profile: "general",
            cus_name: paymentData.name,
            cus_email: paymentData.email,
            cus_add1: paymentData.address,
            cus_add2: "N/A",
            cus_city: "Dhaka",
            cus_state: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: paymentData.contactNumber,
            cus_fax: "01711111111",
            ship_name: "Customer Name",
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "Dhaka",
            ship_state: "Dhaka",
            ship_postcode: 1000,
            ship_country: "N/A",
        };
        const response = yield (0, axios_1.default)({
            method: "post",
            url: config_1.default.ssl.ssl_payment_api,
            data: data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data;
    }
    catch (err) {
        throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "Payment Error Occured...!!");
    }
});
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)({
            method: "GET",
            url: `${config_1.default.ssl.ssl_validation_api}?val_id=${payload.val_id}&store_id=${config_1.default.ssl.store_id}&store_passwd=${config_1.default.ssl.store_pass}&format=json`,
        });
        return response.data;
    }
    catch (error) {
        throw new APIErrors_1.default(http_status_1.default.BAD_REQUEST, "Payment Validation Failed");
    }
});
exports.SSLService = {
    initPayment,
    validatePayment,
};
