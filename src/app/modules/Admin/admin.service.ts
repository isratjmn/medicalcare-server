
import { Admin, Prisma, UserStatus } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import prisma from "../../../shared/prisma";
import { IAdminFilterRequest } from "./admin.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
type IOptions = {
    page?: number,
    limit: number,
    sortOrder?: string,
    sortBy?: string;
};

type IOptionResult = {
    page: number,
    limit: number,
    skip: number,
    sortOrder?: string,
    sortBy?: string;
};
const calculatePagination = (options: IOptions): IOptionResult => {
    const page: number = Number(options.page) || 1;
    const limit: number = Number(options.limit) || 10;
    const skip = (Number(page) - 1) * limit;
    const sortBy: string = options.sortBy || "createdAt";
    const sortOrder: string = options.sortOrder || "desc";
    return {
        page, limit, skip, sortBy, sortOrder
    };
};

const getAllAdmin = async (params: IAdminFilterRequest, options: IPaginationOptions) => {
    const { page, limit, skip } = calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andConditions: Prisma.AdminWhereInput[] = [];
    if (searchTerm)
    {
        andConditions.push({
            OR: adminSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        });
    }
    if (Object.keys(filterData).length > 0)
    {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        });
    }
    andConditions.push({
        isDeleted: false
    });
    const whereConditions: Prisma.AdminWhereInput = {
        AND: andConditions.length > 0 ? andConditions : undefined
    };
    const result = await prisma.admin.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options.sortBy]: options.sortOrder
        } : {
            createdAt: 'desc'
        }
    });
    const total = await prisma.admin.count({
        where: whereConditions
    });
    return {
        meta: {
            page, limit, total
        },
        data: result
    };

};

const getById = async (id: string): Promise<Admin | null> => {
    const result = await prisma.admin.findUnique({
        where: {
            id, isDeleted: false
        }
    });
    return result;
};

const updateAdmin = async (id: string, data: Partial<Admin>): Promise<Admin> => {

    await prisma.admin.findFirstOrThrow({
        where: {
            id, isDeleted: false
        }
    });
    const result = await prisma.admin.update({
        where: {
            id
        },
        data
    });
    return result;

};

const deleteAdmin = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findFirstOrThrow({
        where: {
            id
        }
    });
    const result = await prisma.$transaction(async (transcationClient) => {
        const adminDeletedData = await transcationClient.admin.delete({
            where: {
                id
            }
        });
        await transcationClient.user.delete({
            where: {
                email: adminDeletedData.email
            }
        });
        return adminDeletedData;
    });
    return result;
};


const softDelete = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findFirstOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });
    const result = await prisma.$transaction(async (transcationClient) => {
        const adminDeletedData = await transcationClient.admin.update({
            where: {
                id
            }, data: {
                isDeleted: true
            }
        });
        await transcationClient.user.update({
            where: {
                email: adminDeletedData.email
            }, data: {
                status: UserStatus.DELETED
            }
        });
        return adminDeletedData;
    });
    return result;
};


export const AdminService = {
    getAllAdmin,
    getById,
    updateAdmin,
    deleteAdmin,
    softDelete
};

/* data = 1 2 3 4 5 6 7 8 9;
page = 2;
limit = 3;
skip = 3;
formula = (page - 1) * limit */