import axios from "axios";
import config from "../../../config";
import APIError from "../../errors/APIErrors";
import httpStatus from "http-status";
import { IPaymentData } from "./ssl.interface";

const initPayment = async (paymentData: IPaymentData) => {
    try
    {
        const data = {
            store_id: config.ssl.store_id,
            store_passwd: config.ssl.store_pass,
            total_amount: paymentData?.amount,
            currency: 'BDT',
            tran_id: paymentData.transactionId,
            success_url: config.ssl.success_url,
            cancel_url: config.ssl.cancel_url,
            fail_url: config.ssl.fail_url,
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'N/A',
            product_name: 'Appointment',
            product_category: 'Service',
            product_profile: 'general',
            cus_name: paymentData.name,
            cus_email: paymentData.email,
            cus_add1: paymentData.address,
            cus_add2: 'N/A',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: paymentData.contactNumber,
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'N/A',
            ship_add2: 'N/A',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'N/A',
        };

        const response = await axios({
            method: 'post',
            url: config.ssl.ssl_payment_api,
            data: data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        return response.data;
    } catch (err)
    {
        throw new APIError(httpStatus.BAD_REQUEST, "Payment Error Occured...!!");
    }

};


const validatePayment = async (payload: any) => {
    try
    {
        const response = await axios({
            method: "GET",
            url: `${config.ssl.ssl_validation_api}?val_id=${payload.val_id}&store_id=${config.ssl.store_id}&store_passwd=${config.ssl.store_pass}&format=json`
        });
        return response.data;

    } catch (error)
    {
        throw new APIError(httpStatus.BAD_REQUEST, "Payment Validation Failed");

    }
};



export const SSLService = {
    initPayment, validatePayment
};