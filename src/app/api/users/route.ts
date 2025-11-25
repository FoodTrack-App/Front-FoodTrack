import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const BACKEND = process.env.BACKEND_API_URL || "http://localhost:5000";
    
    console.log("API Route POST - Body recibido:", body);
    console.log("API Route POST - URL del backend:", `${BACKEND}/api/users`);
    
    const response = await fetch(`${BACKEND}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("API Route POST - Status de respuesta:", response.status);
    
    const data = await response.json();
    console.log("API Route POST - Datos recibidos:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API Route POST - Error:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
