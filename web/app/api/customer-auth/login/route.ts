import { NextResponse } from "next/server";
import { API_BASE_URL, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";

export async function POST(request: Request) {
  return forwardAuthRequest(request, "/customer-auth/login");
}

async function forwardAuthRequest(request: Request, path: string) {
  const body = await request.text();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body,
  });
  const payload = await response.text();
  const result = new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
  const secureCookie = process.env.NODE_ENV === "production" && new URL(request.url).protocol === "https:";
  if (response.ok) {
    const responseData = JSON.parse(payload) as { data?: { session?: { token?: string; expiresAt?: string } } };
    const session = responseData.data?.session;
    if (session?.token) {
      result.cookies.set(CUSTOMER_SESSION_COOKIE, session.token, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "lax",
        path: "/",
        expires: session.expiresAt ? new Date(session.expiresAt) : undefined,
        maxAge: 60 * 60 * 24 * 30,
      });
    } else {
      return NextResponse.json({ error: "Authentication service did not return a session." }, { status: 502 });
    }
  }
  return result;
}
