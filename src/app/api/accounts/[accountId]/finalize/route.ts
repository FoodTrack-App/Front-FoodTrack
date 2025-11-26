import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    const response = await fetch(
      `${baseUrl}/accounts/${accountId}/finalize`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PUT /api/accounts/[accountId]/finalize] Error:', error);
    return NextResponse.json(
      { success: false, message: "Error al finalizar cuenta" },
      { status: 500 }
    );
  }
}
