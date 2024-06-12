/* eslint-disable @typescript-eslint/no-explicit-any */

import { PaymentStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { SSLService } from "../SSL/ssl.service";

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

const initPayment = async (appointmentId: any) => {
	try {
		const paymentData = await prisma.payment.findFirst({
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
			throw new Error(
				`Payment data for appointment ID ${appointmentId} not found.`
			);
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
		const result = await SSLService.initPayment(initPaymentData);
		// Check if payment initiation was successful
		if (!result || !result.GatewayPageURL) {
			throw new Error("Failed to initiate payment.");
		}
		return {
			paymentUrl: result.GatewayPageURL,
		};
	} catch (err: any) {
		console.error("Error initiating payment:", err.message);
		throw err;
	}
};

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

const validatePayment = async (payload: any) => {
	const { tran_id } = payload;

	await prisma.$transaction(async (transactionClient) => {
		const paymentData = await transactionClient.payment.update({
			where: {
				transactionId: tran_id,
			},
			data: {
				status: PaymentStatus.PAID,
				paymentGatewayData: payload,
			},
		});

		await transactionClient.appointment.update({
			where: {
				id: paymentData.appointmentId,
			},
			data: {
				paymentStatus: PaymentStatus.PAID,
			},
		});
	});

	return {
		massage: "Payment Success",
	};
};

export const PaymentService = {
	initPayment,
	validatePayment,
};
