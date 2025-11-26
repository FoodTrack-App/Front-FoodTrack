import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ claveRestaurante: string }> }
) {
  try {
    const { claveRestaurante } = await params;
    console.log("[API Route Tables] Obteniendo mesas para:", claveRestaurante);
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const url = `${baseUrl}/tables/restaurant/${claveRestaurante}`;
    console.log("[API Route Tables] URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("[API Route Tables] Response status:", response.status);

    const data = await response.json();
    console.log("[API Route Tables] Data recibida:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Route Tables] Error:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener mesas" },
      { status: 500 }
    );
  }
}
