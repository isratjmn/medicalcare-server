import { IPatientUpdate } from './patient.interface';
import { Patient, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";


const updatePatient = async (id: string, payload: Partial<IPatientUpdate>): Promise<Patient | null> => {
    const { patienthealthData, medicalReport, ...patientData } = payload;
    console.log(medicalReport);
    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    await prisma.$transaction(async (transactionClient) => {
        // Updated Patient Data
        await transactionClient.patient.update({
            where: {
                id
            }, data: patientData,
            include: {
                patienthealthData: true,
                medicalReport: true
            }
        });

        // Create or Update Patient health Data
        if (patienthealthData)
        {
            const healthData = await transactionClient.patienthealthData.upsert({
                where: {
                    patientId: patientInfo.id
                },
                update: patienthealthData,
                create: {
                    ...patienthealthData,
                    patientId: patientInfo.id
                }
            });
            console.log(healthData);
        }
        if (medicalReport)
        {
            const report = await transactionClient.medicalReport.create({
                data: {
                    ...medicalReport,
                    patientId: patientInfo.id
                }
            });
        }
    });
    const responseData = await prisma.patient.findUnique({
        where: {
            id: patientInfo.id
        }, include: {
            patienthealthData: true,
            medicalReport: true
        }
    });
    return responseData;


};

const deletePatient = async (id: string): Promise<Patient | null> => {
    const result = await prisma.$transaction(async (tx) => {
        // Delete medical Report 
        await tx.medicalReport.deleteMany({
            where: {
                patientId: id
            }
        });
        // Check if patient health data exists before attempting to delete
        const existingHealthData = await tx.patienthealthData.findMany({
            where: {
                patientId: id
            }
        });
        if (existingHealthData)
        {
            // Delete Patient Health Data
            await tx.patienthealthData.deleteMany({
                where: {
                    patientId: id
                }
            });
        }
        const deletedPatient = tx.patient.delete({
            where: {
                id
            }
        });
        await tx.user.delete({
            where: {
                email: (await deletedPatient).email
            }
        });
        return deletedPatient;
    });
    return result;
};

const softDeletePatient = async (id: string): Promise<Patient | null> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deletedPatient = await transactionClient.patient.update({
            where: {
                id
            }, data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: deletedPatient.email
            }, data: {
                status: UserStatus.DELETED
            }
        });

        return deletedPatient;
    });
};


export const PatientServices = {
    updatePatient, deletePatient, softDeletePatient
};