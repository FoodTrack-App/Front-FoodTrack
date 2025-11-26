import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ claveRestaurante: string }> }
) {
  try {
    const { claveRestaurante } = await params;
    console.log("[API Route] Obteniendo cuentas para:", claveRestaurante);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const url = `${baseUrl}/accounts/restaurant/${claveRestaurante}/open`;
    console.log("[API Route] URL:", url);

    const response = await fetch(url);
    console.log("[API Route] Response status:", response.status);

    const data = await response.json();
    console.log("[API Route] Data recibida:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Route] Error:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener cuentas abiertas" },
      { status: 500 }
    );
  }
}
