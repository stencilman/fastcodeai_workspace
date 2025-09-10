import { NextRequest, NextResponse } from "next/server";
import { updateDocumentStatus } from "@/data/documents";
import { DocumentStatus } from "@/models/document";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { reviewerId, notes } = body;

        if (!reviewerId) {
            return new NextResponse(JSON.stringify({ error: "Reviewer ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const updatedDocument = await updateDocumentStatus(
            id,
            DocumentStatus.REJECTED,
            reviewerId,
            notes
        );

        if (!updatedDocument) {
            return new NextResponse(JSON.stringify({ error: "Document not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return NextResponse.json(updatedDocument);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
        return new NextResponse(JSON.stringify({ error: "Failed to process request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
