import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/data/users";

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const user = getUserById(id);

    if (!user) {
        // Return 404 if user not found
        return new NextResponse(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    return NextResponse.json(user);
}
