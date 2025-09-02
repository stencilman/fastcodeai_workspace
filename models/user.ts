export enum UserRole {
    CANDIDATE = 'CANDIDATE',
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',
}

export enum BloodGroup {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
}

export interface User {
    id: string;
    email: string; // company email
    name: string;
    phone: string;
    address: string;
    role: UserRole;
    slackUserId?: string; // set once invited
    linkedinProfile?: string;
    bloodGroup?: BloodGroup;
    createdAt: Date;
    updatedAt: Date;
}
