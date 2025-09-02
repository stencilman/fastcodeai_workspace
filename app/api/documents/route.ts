import { NextRequest, NextResponse } from "next/server";
import { documents } from "@/data/documents";

export async function GET(request: NextRequest) {
    // Get userId from query params if provided
    const userId = request.nextUrl.searchParams.get("userId");

    if (userId) {
        // Filter documents by userId if provided
        const userDocuments = documents.filter(doc => doc.userId === userId);
        return NextResponse.json(userDocuments);
    }

    // Return all documents if no userId provided
    return NextResponse.json(documents);
}
