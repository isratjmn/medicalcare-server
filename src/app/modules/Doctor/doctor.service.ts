import { doctorSearchableFields } from './doctor.constant';
import { Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { IDoctorFilterRequest } from './doctor.interface';
import { IPaginationOptions } from '../../interfaces/pagination';

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
        } : { createdAt: "desc" },
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

const updateIntoDB = async (id: string, payload: any) => {
    const { specialities, ...doctorData } = payload;

    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: {
            id
        },
        include: {
            doctorSpecialties: true
        }
    });

    await prisma.$transaction(async (transactionClient) => {
        const updatedDoctorData = await transactionClient.doctor.update({
            where: { id },
            data: doctorData,
            // include: { doctorSpecialties: true }
        });

        if (specialities && specialities.length > 0)
        {
            // Delete Speciality
            const deleteSpecialitiesIDs = specialities.filter((speciality: { isDeleted: any; }) => speciality.isDeleted);
            // console.log(deleteSpecialitiesIDs);

            for (const speciality of deleteSpecialitiesIDs)
            {
                await transactionClient.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: doctorInfo.id,
                        specialitiesId: speciality.specialitiesId
                    }
                });
            }

            // Create Specialities
            const createSpecialitiesIDs = specialities.filter((speciality: { isDeleted: any; }) => !speciality.isDeleted);
            console.log(createSpecialitiesIDs);
            for (const speciality of createSpecialitiesIDs)
            {
                await transactionClient.doctorSpecialties.create({
                    data: {
                        doctorId: doctorInfo.id,
                        specialitiesId: speciality.specialitiesId
                    }
                });
            }

        }
    });
    const result = await prisma.doctor.findUnique({
        where: {
            id: doctorInfo.id
        }, include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }


    });
    return result;
};


export const DoctorServices = {
    getAllDoctors,
    updateIntoDB
};