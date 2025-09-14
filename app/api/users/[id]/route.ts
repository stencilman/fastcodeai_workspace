import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/data/user";
import { UpdateUserInput } from "@/models/user";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
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
        if (body.password !== undefined) updateData.password = body.password;
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();

        // Check if user exists
        const existingUser = await getUserById(id);
        if (!existingUser) {
            return NextResponse.json(
                { message: "User not found" },
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
        if (body.password !== undefined) updateData.password = body.password;
        if (body.image !== undefined) updateData.image = body.image;
        if (body.onboardingStatus !== undefined) updateData.onboardingStatus = body.onboardingStatus;

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
            { message: "Failed to update user" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {

        // Check if user exists
        const existingUser = await getUserById(id);
        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Delete the user
        await deleteUser(id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
