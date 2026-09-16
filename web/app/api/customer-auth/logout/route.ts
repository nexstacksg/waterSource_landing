import { NextResponse } from "next/server";
import { API_BASE_URL, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) await fetch(`${API_BASE_URL}/customer-auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  const response = NextResponse.redirect(new URL("/portal/login", request.url));
  response.cookies.delete(CUSTOMER_SESSION_COOKIE);
  return response;
}
