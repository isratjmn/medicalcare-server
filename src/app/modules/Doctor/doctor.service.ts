import { doctorSearchableFields } from './doctor.constant';
import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { IDoctorFilterRequest, IDoctorUpdate, ISpecialties } from './doctor.interface';
import APIError from "../../errors/APIErrors";

import { IPaginationOptions } from '../../interfaces/pagination';
import httpStatus from 'http-status';
import { asyncForEach } from '../../../shared/utils';

const getAllDoctors = async (filters: IDoctorFilterRequest, options: IPaginationOptions) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialities, ...filterData } = filters;
    const andConditions: Prisma.DoctorWhereInput[] = [];
    if (searchTerm)
    {
        andConditions.push({
            OR: doctorSearchableFields.map(
                field => ({
                    [field]: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                }))
        });
    }
    // doctor => doctorSpecialties > specialities
    if (specialities && specialities.length > 0)
    {
        andConditions.push({
            doctorSpecialties:
            {
                some: {
                    specialities: {
                        title: {
                            contains: specialities,
                            mode: "insensitive"
                        }
                    }
                }
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
    andConditions.push({
        isDeleted: false
    });
    const whereConditions: Prisma.DoctorWhereInput =
        andConditions.length > 0 ? {
            AND: andConditions
        } : {};
    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options.sortBy]: options.sortOrder
        } : { averageRating: "desc" },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    });
    const total = await prisma.doctor.count({
        where: whereConditions
    });
    return {
        meta: {
            total, page, limit
        }, data: result
    };
};


const getByIdFromDB = async (id: string) => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: true,
            doctorSchedules: true,
            review: true
        }
    });

    return result;
};



const updateIntoDB = async (
    id: string,
    payload: Partial<IDoctorUpdate>,
): Promise<Doctor | null> => {
    console.log(payload);
    const { specialities, ...doctorData } = payload;
    await prisma.$transaction(async (transactionClient: any) => {
        const result = await transactionClient.doctor.update({
            where: {
                id,
            },
            data: doctorData,
        });
        if (!result)
        {
            throw new APIError(httpStatus.BAD_REQUEST, 'Unable to update Doctor');
        }
        if (specialities && specialities.length > 0)
        {
            const deleteSpecialities = specialities.filter(
                speciality => speciality.specialitiesId && speciality.isDeleted,
            );

            const newSpecialities = specialities.filter(
                speciality => speciality.specialitiesId && !speciality.isDeleted,
            );

            await asyncForEach(
                deleteSpecialities,
                async (deleteDoctorSpeciality: ISpecialties) => {
                    await transactionClient.doctorSpecialties.deleteMany({
                        where: {
                            AND: [
                                {
                                    doctorId: id,
                                },
                                {
                                    specialtiesId: deleteDoctorSpeciality.specialitiesId,
                                },
                            ],
                        },
                    });
                },
            );
            await asyncForEach(
                newSpecialities,
                async (insertDoctorSpeciality: ISpecialties) => {
                    await transactionClient.doctorSpecialties.create({
                        data: {
                            doctorId: id,
                            specialtiesId: insertDoctorSpeciality.specialitiesId,
                        },
                    });
                },
            );
        }
        return result;
    });

    const responseData = await prisma.doctor.findUnique({
        where: {
            id,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
        },
    });
    return responseData;
};


const deleteDoctor = async (id: string): Promise<Doctor> => {
    const result = await prisma.$transaction(async (transcationClient) => {
        const doctorDeletedData = await transcationClient.doctor.delete({
            where: {
                id
            },
        });
        await transcationClient.user.delete({
            where: {
                email: doctorDeletedData.email
            }
        });
        return doctorDeletedData;
    });
    return result;
};


const softDelete = async (id: string): Promise<Doctor> => {
    const result = await prisma.$transaction(async (transcationClient) => {
        const doctorDeletedData = await transcationClient.doctor.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });
        await transcationClient.user.update({
            where: {
                email: doctorDeletedData.email
            },
            data: {
                status: UserStatus.DELETED
            }
        });
        return doctorDeletedData;
    });
    return result;
};


export const DoctorServices = {
    getAllDoctors,
    getByIdFromDB,
    updateIntoDB,
    deleteDoctor,
    softDelete
};

