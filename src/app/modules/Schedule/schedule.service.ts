import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";
import { Prisma, Schedule } from "@prisma/client";
import { IFilterRequest, ISchedule } from "./schedule.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";

const createScheduleIntoDB = async (payload: ISchedule): Promise<Schedule[]> => {
    const { startDate, endDate, startTime, endTime } = payload;
    const intervalTime = 30;
    const schedules = [];
    const currentDate = new Date(startDate); // Start Date
    const lastDate = new Date(endDate); // End Date
    while (currentDate <= lastDate)
    {
        const startDateTime = new Date(
            addHours(
                `${format(currentDate, "yyyy-MM-dd")}`,
                Number(startTime.split(":")[0])
            )
        );
        const endDateTime = new Date(
            addHours(
                `${format(currentDate, "yyyy-MM-dd")}`,
                Number(endTime.split(":")[0])
            )
        );
        while (startDateTime < endDateTime)
        {
            const scheduleData = {
                startDateTime: startDateTime,
                endDateTime: addMinutes(startDateTime, intervalTime)
            };
            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime
                }
            });
            if (!existingSchedule)
            {
                const result = await prisma.schedule.create({
                    data: scheduleData
                });
                schedules.push(result);
            }
            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedules;
};

const getAllSchedule = async (
    filters: IFilterRequest,
    options: IPaginationOptions,
    user: IAuthUser
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { startDate, endDate, ...filterData } = filters;
    console.log({ startDate, endDate });
    const andConditions: Prisma.ScheduleWhereInput[] = [];
    if (startDate && endDate)
    {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: startDate
                    },
                }, {
                    endDateTime: {
                        lte: endDate
                    }
                }
            ]
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
    const whereConditions: Prisma.ScheduleWhereInput =
        andConditions.length > 0 ? {
            AND: andConditions
        } : {};

    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user?.email
            }
        }
    });
    console.log(doctorSchedules);

    const doctorScheduleIds = doctorSchedules.map(schedule =>
        schedule.scheduleId
    );
    console.log(doctorScheduleIds);
    const result = await prisma.schedule.findMany({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options.sortBy]: options.sortOrder
        } : { createdAt: "desc" },
    });
    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        },
    });
    return {
        meta: {
            total,
            page,
            limit
        }, data: result
    };
};


export const ScheduleService = {
    createScheduleIntoDB, getAllSchedule
};