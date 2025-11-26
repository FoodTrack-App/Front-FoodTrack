import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const body = await request.json();
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const response = await fetch(
      `${baseUrl}/accounts/${accountId}/close`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PUT /api/accounts/[accountId]/close] Error:', error);
    return NextResponse.json(
      { success: false, message: "Error al cerrar cuenta" },
      { status: 500 }
    );
  }
}
