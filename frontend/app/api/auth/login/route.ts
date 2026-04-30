import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const upstream = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: data.detail ?? "Invalid credentials" },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();
  const response = NextResponse.json({ success: true, role: data.role, username: data.username });

  // httpOnly cookie — verified by middleware (not readable by client JS)
  response.cookies.set("auth-token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  // Readable cookie — for UI (role, username display)
  response.cookies.set(
    "auth-info",
    Buffer.from(JSON.stringify({ username: data.username, role: data.role })).toString("base64"),
    {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    }
  );

  return response;
}
