import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string; itemId: string }> }
) {
  try {
    const { accountId, itemId } = await params;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const response = await fetch(
      `${baseUrl}/accounts/${accountId}/items/${itemId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[DELETE /api/accounts/[accountId]/items/[itemId]] Error:', error);
    return NextResponse.json(
      { success: false, message: "Error al eliminar item" },
      { status: 500 }
    );
  }
}
