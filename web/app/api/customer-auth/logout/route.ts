import { NextResponse } from "next/server";
import { API_BASE_URL, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/customer-auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // End the local session even if the upstream service cannot be reached.
    }
  }
  const response = NextResponse.json(
    { success: true },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
  response.cookies.delete(CUSTOMER_SESSION_COOKIE);
  return response;
}
