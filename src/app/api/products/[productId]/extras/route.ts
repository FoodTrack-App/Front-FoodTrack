import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    console.log("[Frontend API] POST extras - Producto:", productId);
    console.log("[Frontend API] Body recibido:", body);
    console.log("[Frontend API] URL backend:", `${baseUrl}/products/${productId}/extras`);
    
    const response = await fetch(`${baseUrl}/products/${productId}/extras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log("[Frontend API] Respuesta del backend:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[Frontend API] Error en POST extras:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    );
  }
}
