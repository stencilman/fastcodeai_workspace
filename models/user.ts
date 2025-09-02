export enum UserRole {
    CANDIDATE = 'CANDIDATE',
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',
}

export interface User {
    id: string;
    email: string; // company email
    name: string;
    phone: string;
    address: string;
    role: UserRole;
    slackUserId?: string; // set once invited
    createdAt: Date;
    updatedAt: Date;
}
