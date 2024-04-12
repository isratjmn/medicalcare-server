import { Prisma, Schedule, UserRole } from '@prisma/client';
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from 'uuid';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import shortid from 'shortid';


const createAppointment = async (user: IAuthUser, payload: any) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId
        }
    });
    const doctorScheduleData = await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: doctorData.id,
            scheduleId: payload.scheduleId,
            isBooked: false

        }
    });
    const videoCallingId: string = uuidv4();

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }, include: {
                patient: true,
                doctor: true,
                schedule: true
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData.id
            }

        });
        // PH-Medical-Care-dateTime
        const today = new Date();

        // const transactionId = `PH-Medical-Care-${today.getFullYear()}-${uuidv4()}`;
        // Generate a shorter transaction ID
        const transactionId = `PH-${shortid.generate()}`;

        await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appintmentFee,
                transactionId,

            }
        });
        return appointmentData;

    });
    return result;
};

const getMyAppointmentIntoDB = async (
    user: IAuthUser,
    filters: any,
    options: IPaginationOptions
) => {
    const {
        limit, page, skip } = paginationHelper.calculatePagination(options);
    const { ...filterData } = filters;
    console.log(user, filters, options);

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (user?.role === UserRole.PATIENT)
    {
        andConditions.push({
            patient: {
                email: user?.email
            }
        });
    } else if (user?.role === UserRole.DOCTOR)
    {
        andConditions.push({
            doctor: {
                email: user?.email
            }
        });
    }


    if (Object.keys(filterData).length > 0)
    {
        const filterConditions = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key],
            },
        }));
        andConditions.push(...filterConditions);
    }

    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? {
            AND: andConditions
        } : {};
    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options.sortBy]: options.sortOrder
        } : { createdAt: "desc" },
        include: user?.role === UserRole.PATIENT ? {
            doctor: true,
            schedule: true
        } : {
            patient: {
                include: {
                    medicalReport: true,
                    patienthealthData: true
                }
            },
            schedule: true
        }
    });

    const total = await prisma.appointment.count({
        where: whereConditions
    });

    return {
        meta: {
            total, page, limit
        }, data: result
    };



};


export const AppointmentService = {
    createAppointment, getMyAppointmentIntoDB
};

