import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Get cookies for debugging
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  // Filter auth-related cookies
  const authCookies = allCookies.filter(
    (cookie) =>
      cookie.name.includes("next-auth") || cookie.name.includes("session")
  );

  const debugInfo = {
    session,
    authCookies: authCookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value.substring(0, 10) + "...", // Truncate value for security
    })),
    hasSession: !!session,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  return NextResponse.json(debugInfo);
}
