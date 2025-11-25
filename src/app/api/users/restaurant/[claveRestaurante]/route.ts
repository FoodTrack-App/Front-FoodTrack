import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ claveRestaurante: string }> }
) {
  try {
    const { claveRestaurante } = await params;
    const BACKEND = process.env.BACKEND_API_URL || "http://localhost:5000";
    
    console.log("API Route - Clave del restaurante:", claveRestaurante);
    console.log("API Route - URL del backend:", `${BACKEND}/api/users/restaurant/${claveRestaurante}`);
    
    const response = await fetch(`${BACKEND}/api/users/restaurant/${claveRestaurante}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("API Route - Status de respuesta:", response.status);
    
    const data = await response.json();
    console.log("API Route - Datos recibidos:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API Route - Error:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
