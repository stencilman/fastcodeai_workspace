import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/data/user";
import { UpdateUserInput } from "@/models/user";
import { auth } from "@/auth";

// GET endpoint to fetch user details (admin only)
export async function GET(
    _request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Check if the current user is an admin
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Properly await and extract the id parameter
        const params = await context.params;
        const id = params.id;
        const user = await getUserById(id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

// PATCH endpoint to update user details (admin only)
export async function PATCH(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Check if the current user is an admin
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Properly await and extract the id parameter
        const params = await context.params;
        const id = params.id;
        const body = await request.json();

        // Check if user exists
        const existingUser = await getUserById(id);
        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Only pass fields that are in the Prisma schema
        const updateData: UpdateUserInput = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.role !== undefined) updateData.role = body.role;
        if (body.firstName !== undefined) updateData.firstName = body.firstName;
        if (body.lastName !== undefined) updateData.lastName = body.lastName;
        if (body.image !== undefined) updateData.image = body.image;

        // Update the user
        const updatedUser = await updateUser(id, {
            ...updateData,
            // Include non-DB fields from the request
            phone: body.phone,
            address: body.address,
            slackUserId: body.slackUserId,
            linkedinProfile: body.linkedinProfile,
            bloodGroup: body.bloodGroup,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
