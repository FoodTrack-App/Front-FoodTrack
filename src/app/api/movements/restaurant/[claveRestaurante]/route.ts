import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// GET - Obtener movimientos por restaurante y fecha
export async function GET(
  request: Request,
  context: { params: Promise<{ claveRestaurante: string }> }
) {
  try {
    const { claveRestaurante } = await context.params;
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");

    let url = `${API_URL}/movements/restaurant/${claveRestaurante}`;
    if (fecha) {
      url += `?fecha=${fecha}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Error al obtener movimientos" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Error en GET /api/movements/restaurant/[claveRestaurante]:",
      error
    );
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
