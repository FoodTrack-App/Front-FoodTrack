import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // NEXT_PUBLIC_API_URL ya incluye /api, no duplicar
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    console.log('[POST /api/accounts] Creating account with data:', body);
    console.log('[POST /api/accounts] Calling:', `${baseUrl}/accounts`);

    const response = await fetch(
      `${baseUrl}/accounts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    console.log('[POST /api/accounts] Response status:', response.status);
    const data = await response.json();
    console.log('[POST /api/accounts] Response data:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[POST /api/accounts] Error:', error);
    return NextResponse.json(
      { success: false, message: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}
