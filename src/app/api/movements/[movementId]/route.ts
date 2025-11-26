import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// DELETE - Eliminar movimiento
export async function DELETE(
  request: Request,
  context: { params: Promise<{ movementId: string }> }
) {
  try {
    const { movementId } = await context.params;

    const response = await fetch(`${API_URL}/movements/${movementId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Error al eliminar movimiento" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en DELETE /api/movements/[movementId]:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
