import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUser } from "@/data/user";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tourCompleted } = body;

    if (typeof tourCompleted !== "boolean") {
      return NextResponse.json(
        { error: "tourCompleted must be a boolean" },
        { status: 400 }
      );
    }

    // Update user's tour completion status
    const updatedUser = await updateUser(session.user.id, {
      tourCompleted,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating tour completion:", error);
    return NextResponse.json(
      { error: "Failed to update tour completion" },
      { status: 500 }
    );
  }
}
