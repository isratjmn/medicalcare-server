"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ssl_service_1 = require("../SSL/ssl.service");
/* const initPayment = async (appointmentId: string) => {
    const paymentData = await prisma.payment.findFirstOrThrow({
        where: {
            appointmentId
        }, include: {
            appointment: {
                include: {
                    patient: true
                }
            }
        }
    });
    const initPaymentData = {
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        name: paymentData.appointment.patient.name,
        email: paymentData.appointment.patient.email,
        address: paymentData.appointment.patient.address,
        contactNumber: paymentData.appointment.patient.contactNumber,
    };
    const result = await SSLService.initPayment(initPaymentData);
    return {
        paymentUrl: result.GatewayPageURL
    };

}; */
const initPayment = (appointmentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentData = yield prisma_1.default.payment.findFirst({
            where: {
                appointmentId,
            },
            include: {
                appointment: {
                    include: {
                        patient: true,
                    },
                },
            },
        });
        // Check if payment data exists
        if (!paymentData) {
            throw new Error(`Payment data for appointment ID ${appointmentId} not found.`);
        }
        // Construct payment information
        const initPaymentData = {
            amount: paymentData.amount,
            transactionId: paymentData.transactionId,
            name: paymentData.appointment.patient.name,
            email: paymentData.appointment.patient.email,
            address: paymentData.appointment.patient.address || "",
            contactNumber: paymentData.appointment.patient.contactNumber || "",
        };
        // Initiate payment
        const result = yield ssl_service_1.SSLService.initPayment(initPaymentData);
        // Check if payment initiation was successful
        if (!result || !result.GatewayPageURL) {
            throw new Error("Failed to initiate payment.");
        }
        return {
            paymentUrl: result.GatewayPageURL,
        };
    }
    catch (err) {
        console.error("Error initiating payment:", err.message);
        throw err;
    }
});
/* amount = 1150.00 & bank_tran_id=151114130739MqCBNx5 & card_brand=VISA & card_issuer=BRAC + BANK % 2C + LTD.& card_issuer_country=Bangladesh & card_issuer_country_code=BD & card_no=432149XXXXXX0667 & card_type=VISA - Brac + bank¤cy = BDT & status=VALID & store_amount=1104.00 & store_id=progr6612bd4268348 & tran_date=2015 - 11 - 14 + 13 % 3A07 % 3A12 & tran_id=5646dd9d4b484 & val_id=151114130742Bj94IBUk4uE5GRj & verify_sign=df9e6103454a0c056c93e05ea2e28080 & verify_key=amount % 2Cbank_tran_id % 2Ccard_brand % 2Ccard_issuer % 2Ccard_issuer_country % 2Ccard_issuer_country_code % 2Ccard_no % 2Ccard_type % 2Ccurrency % 2Cstatus % 2Cstore_amount % 2Cstore_id % 2Ctran_date % 2Ctran_id % 2Cval_id; */
// ssl Commercez ipn listener Query
// const validatePayment = async (payload: any) => {
// 	/* if (!payload || !payload.status || !(payload.status === "VALID"))
//     {
//         return {
//             message: "invalid Payment....!!"
//         };
//     }
//     const response = await SSLService.validatePayment(payload);
//     if (response.status !== "VALID")
//     {
//         return {
//             messgae: "Payment Failed..!!"
//         };
//     } */
// 	const response = payload;
// 	await prisma.$transaction(async (tx) => {
// 		const updatedPaymentData = await tx.payment.update({
// 			where: {
// 				transactionId: response.tran_id,
// 			},
// 			data: {
// 				status: PamentStatus.PAID,
// 				paymentGatewayData: response,
// 			},
// 		});
// 		await tx.appointment.update({
// 			where: {
// 				id: updatedPaymentData.appointmentId,
// 			},
// 			data: {
// 				paymentStatus: PamentStatus.PAID,
// 			},
// 		});
// 	});
// 	return {
// 		message: "Payment Successful ...!!",
// 	};
// };
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id } = payload;
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const paymentData = yield transactionClient.payment.update({
            where: {
                transactionId: tran_id,
            },
            data: {
                status: client_1.PaymentStatus.PAID,
                paymentGatewayData: payload,
            },
        });
        yield transactionClient.appointment.update({
            where: {
                id: paymentData.appointmentId,
            },
            data: {
                paymentStatus: client_1.PaymentStatus.PAID,
            },
        });
    }));
    return {
        massage: "Payment Success",
    };
});
exports.PaymentService = {
    initPayment,
    validatePayment,
};
