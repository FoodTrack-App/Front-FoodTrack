import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const BACKEND = process.env.BACKEND_API_URL || "http://localhost:5000";
    
    const response = await fetch(`${BACKEND}/api/user/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const BACKEND = process.env.BACKEND_API_URL || "http://localhost:5000";
    
    let endpoint = `/api/user/${userId}`;
    
    // Determinar si es actualización de contacto o contraseña
    if (body.currentPassword && body.newPassword) {
      endpoint += "/password";
    } else {
      endpoint += "/contact";
    }
    
    const response = await fetch(`${BACKEND}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
