import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[API Route] POST /api/products - Iniciando");
    const formData = await request.formData();
    
    // Log de los campos del FormData
    for (const [key, value] of formData.entries()) {
      console.log(`[API Route] FormData - ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const backendUrl = `${baseUrl}/products`;
    console.log("[API Route] Enviando a backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
    });

    console.log("[API Route] Respuesta del backend:", response.status, response.statusText);
    const data = await response.json();
    console.log("[API Route] Data del backend:", data);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Error al crear producto" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
