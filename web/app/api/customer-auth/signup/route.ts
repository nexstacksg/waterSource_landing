import { NextResponse } from "next/server";
import { API_BASE_URL, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const input = (await request.json()) as { name?: string; email?: string; password?: string; phone?: string };
  if (!input.phone?.trim()) {
    return NextResponse.json({ error: "Phone number is required to create an account." }, { status: 400 });
  }
  const names = input.name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const response = await fetch(`${API_BASE_URL}/customer-auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ firstName: names.shift() ?? "Customer", lastName: names.join(" "), email: input.email, password: input.password, phone: input.phone ?? "" }),
  });
  const payload = await response.text();
  const result = new NextResponse(payload, { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } });
  const secureCookie = process.env.NODE_ENV === "production" && new URL(request.url).protocol === "https:";
  if (response.ok) {
    const responseData = JSON.parse(payload) as { data?: { session?: { token?: string; expiresAt?: string } } };
    const session = responseData.data?.session;
    if (session?.token) result.cookies.set(CUSTOMER_SESSION_COOKIE, session.token, { httpOnly: true, secure: secureCookie, sameSite: "lax", path: "/", expires: session.expiresAt ? new Date(session.expiresAt) : undefined, maxAge: 60 * 60 * 24 * 30 });
    else return NextResponse.json({ error: "Account was created but no login session was returned." }, { status: 502 });
  }
  return result;
}
