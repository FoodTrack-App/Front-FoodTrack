import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ extraId: string }> }
) {
  try {
    const { extraId } = await params;
    const body = await request.json();
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    const response = await fetch(`${baseUrl}/extras/${extraId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error en PUT /api/extras/[extraId]/status:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
