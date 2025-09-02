import { NextRequest, NextResponse } from "next/server";
import { getDocumentById, updateDocumentStatus } from "@/data/documents";
import { DocumentStatus } from "@/models/document";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const body = await request.json();
        const { reviewerId } = body;

        if (!reviewerId) {
            return new NextResponse(JSON.stringify({ error: "Reviewer ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const updatedDocument = updateDocumentStatus(
            id,
            DocumentStatus.APPROVED,
            reviewerId
        );

        if (!updatedDocument) {
            return new NextResponse(JSON.stringify({ error: "Document not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return NextResponse.json(updatedDocument);
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: "Failed to process request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
