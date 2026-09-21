import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";

export async function GET() {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json(
      { customer: null },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  const response = await fetch(`${API_BASE_URL}/customer-auth/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}
