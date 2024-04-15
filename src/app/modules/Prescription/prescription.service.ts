import { AppointmentStatus, PamentStatus, Prescription } from '@prisma/client';
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import APIError from '../../errors/APIErrors';
import httpStatus from 'http-status';

const InsertPrescription = async (user: IAuthUser, payload: Partial<Prescription>) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: AppointmentStatus.COMPLETED,
            paymentStatus: PamentStatus.PAID
        }, include: {
            doctor: true
        }
    });
    if (!(user?.email === appointmentData.doctor.email))
    {
        throw new APIError(httpStatus.BAD_REQUEST, "This is not your Appointment!!!");
    }

    const result = await prisma.prescription.create({
        data: {
            appointmentId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions as string,
            followUpDate: payload.followUpDate || undefined || null
        }, include: {
            doctor: true,
            patient: true
        }
    });
    console.log({ result });
    return result;

};

export const PrescriptionServices = {
    InsertPrescription
};