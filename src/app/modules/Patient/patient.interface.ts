import { BloodGroup, Gender, MaritalStatus } from "@prisma/client";

export type IPatientFilterRequest = {
	searchTerm?: string | undefined;
	email?: string | undefined;
	contactNo?: string | undefined;
};

type IpatientHealthData = {
	gender: Gender;
	dateOfBirth: string;
	bloodGroup: BloodGroup;
	hasAllergies: boolean;
	hasDiabetes?: boolean;
	height: string;
	weight: string;
	smokingStatus: boolean;
	dietaryPreferences?: string;
	pregnancyStatus?: boolean;
	mentalHealthHistory?: string;
	immunizationStatus?: string;
	hasPastSurgeries?: boolean;
	recentAnxiety?: boolean;
	recentDepression?: boolean;
	maritalStatus?: MaritalStatus;
};

type IMedicalReport = {
	reportName: string;
	reportlink: string;
};

export type IPatientUpdate = {
	name: string;
	contactNumber: string;
	address: string;
	patienthealthData: IpatientHealthData;
	medicalReport: IMedicalReport;
};
