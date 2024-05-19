export type IDoctorFilterRequest = {
    searchTerm?: string | undefined;
    email?: string | undefined;
    contactNumber?: string | undefined;
    gender?: string | undefined;
    appintmentFee?: string | undefined;
    specialities?: string | undefined;
};


export type IDoctorUpdate = {
    name: string;
    profilePhoto: string;
    contactNumber: string;
    address: string;
    registrationNumber: string;
    experience: number;
    gender: 'MALE' | 'FEMALE';
    appintmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    specialities: ISpecialties[];
};

export type ISpecialties = {
    specialitiesId: string;
    isDeleted?: null;
};