import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/data/documents";

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const document = getDocumentById(id);

    if (!document) {
        // Return 404 if document not found
        return new NextResponse(JSON.stringify({ error: "Document not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    return NextResponse.json(document);
}
