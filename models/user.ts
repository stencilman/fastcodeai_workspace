export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export enum OnboardingStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
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
    phone: string; // Not in DB schema, maintained in application layer
    address: string; // Not in DB schema, maintained in application layer
    role: UserRole;
    onboardingStatus: OnboardingStatus;
    slackUserId?: string; // Not in DB schema, maintained in application layer
    linkedinProfile?: string; // Not in DB schema, maintained in application layer
    bloodGroup?: BloodGroup; // Not in DB schema, maintained in application layer
    createdAt: Date;
    updatedAt: Date;

    // Optional fields from Prisma schema that we don't use in the app layer
    firstName?: string;
    lastName?: string;
    emailVerified?: Date;
    password?: string;
    image?: string;
}

// Type for creating a new user - only includes fields that are in the Prisma schema
export interface CreateUserInput {
    name: string;
    email: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    password?: string;
    image?: string;
}

// Type for updating a user - only includes fields that are in the Prisma schema
export interface UpdateUserInput {
    name?: string;
    email?: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    password?: string;
    image?: string;
    onboardingStatus?: OnboardingStatus;
}
