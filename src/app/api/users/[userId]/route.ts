import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const BACKEND = process.env.BACKEND_API_URL || "http://localhost:5000";
    
    console.log("API Route PUT - User ID:", userId);
    console.log("API Route PUT - Body recibido:", body);
    console.log("API Route PUT - URL del backend:", `${BACKEND}/api/users/${userId}`);
    
    const response = await fetch(`${BACKEND}/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("API Route PUT - Status de respuesta:", response.status);
    
    const data = await response.json();
    console.log("API Route PUT - Datos recibidos:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API Route PUT - Error:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const BACKEND = process.env.BACKEND_API_URL || "http://localhost:5000";
    
    console.log("API Route DELETE - User ID:", userId);
    console.log("API Route DELETE - URL del backend:", `${BACKEND}/api/users/${userId}`);
    
    const response = await fetch(`${BACKEND}/api/users/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    console.log("API Route DELETE - Status de respuesta:", response.status);
    
    const data = await response.json();
    console.log("API Route DELETE - Datos recibidos:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API Route DELETE - Error:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
