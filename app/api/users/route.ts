import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getUsersByRole, createUser } from "@/data/user";
import { UserRole, CreateUserInput } from "@/models/user";

export async function GET(_request: NextRequest) {
    try {
        // Get only non-admin users (employees/candidates)
        const users = await getUsersByRole(UserRole.USER);
        
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.email) {
            return NextResponse.json(
                { error: "Name and email are required" },
                { status: 400 }
            );
        }

        // Create the user with our data layer
        // Only pass fields that are in the Prisma schema
        const userData: CreateUserInput = {
            name: body.name,
            email: body.email,
            role: body.role || UserRole.USER,
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password,
            image: body.image,
        };

        const user = await createUser(userData);

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
