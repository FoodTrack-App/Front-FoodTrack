import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; extraId: string }> }
) {
  try {
    const { productId, extraId } = await params;
    const body = await request.json();
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    console.log("[Frontend API] Toggle extra status:", { productId, extraId, body });
    console.log("[Frontend API] Backend URL:", `${baseUrl}/products/${productId}/extras/${extraId}/status`);
    
    const response = await fetch(`${baseUrl}/products/${productId}/extras/${extraId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("[Frontend API] Response status:", response.status);
    const data = await response.json();
    console.log("[Frontend API] Response data:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error en PUT /api/products/[productId]/extras/[extraId]/status:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
