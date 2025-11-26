import { NextResponse } from "next/server";

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Usar localhost directamente o variable de entorno
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const upstream = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json({ success: false, message: data.message ?? 'Authentication failed' }, { status: upstream.status });
    }

    // Si el backend devuelve token (por ejemplo { token: '...' }) lo guardamos en cookie httpOnly
    const token = data.token ?? null;

    const res = NextResponse.json({ success: true, ...(data ?? {}) });

    if (token) {
      res.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });
    }

    return res;
  } catch (err) {
    console.error("/api/auth/login error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
