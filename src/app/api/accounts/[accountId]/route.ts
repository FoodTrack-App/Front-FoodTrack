import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    
    // NEXT_PUBLIC_API_URL ya incluye /api, no duplicar
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    console.log('[GET /api/accounts/[accountId]] accountId:', accountId);
    console.log('[GET /api/accounts/[accountId]] Calling:', `${baseUrl}/accounts/${accountId}`);

    const response = await fetch(
      `${baseUrl}/accounts/${accountId}`
    );

    console.log('[GET /api/accounts/[accountId]] Response status:', response.status);
    const data = await response.json();
    console.log('[GET /api/accounts/[accountId]] Response data:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/accounts/[accountId]] Error:', error);
    return NextResponse.json(
      { success: false, message: "Error al obtener detalle de cuenta" },
      { status: 500 }
    );
  }
}
