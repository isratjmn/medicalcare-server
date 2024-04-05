import { z } from "zod";
import { Gender } from '@prisma/client';

const createAdmin = z.object({
    password: z.string({
        required_error: "Password is required"
    }),
    admin: z.object({
        name: z.string({
            required_error: "Name is required"
        }),
        email: z.string({
            required_error: "Email is required"
        }),
        contactNumber: z.string({
            required_error: "Contact Number is required"
        }),
    })
});

const createDoctor = z.object({
    password: z.string({
        required_error: "Password is required"
    }),
    doctor: z.object({
        name: z.string({
            required_error: "Name is required"
        }),
        email: z.string({
            required_error: "Email is required"
        }),
        contactNumber: z.string({
            required_error: "Contact Number is required"
        }),
        address: z.string().optional(),
        registrationNumber: z.string({
            required_error: "Contact Number is required"
        }),
        experience: z.number().optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE]),

        appintmentFee: z.number({
            required_error: "Appointment Fees is required"
        }),
        qualification: z.string({
            required_error: "Qualification is required"

        }),
        currentWorkingPlace: z.string({
            required_error: "Current Working Place is required"
        }),
        designation: z.string({
            required_error: "Designation is required"
        })
    })
});

const createPatient = z.object({
    password: z.string(),
    patient: z.object({
        name: z.string({
            required_error: "Name is required"
        }),
        email: z.string({
            required_error: "Email is required"
        }),
        contactNumber: z.string({
            required_error: "Contact Number is required"
        }),
        address: z.string({
            required_error: "Address is required"
        })
    })
});

export const UserValidation = {
    createAdmin, createDoctor, createPatient
};