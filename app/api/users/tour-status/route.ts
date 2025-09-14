import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/data/user";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data from database
    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      tourCompleted: user.tourCompleted,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error checking tour completion:", error);
    return NextResponse.json(
      { error: "Failed to check tour completion" },
      { status: 500 }
    );
  }
}
