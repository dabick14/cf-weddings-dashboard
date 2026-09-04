import { NextRequest, NextResponse } from "next/server";
import { fetchGuests } from "@/lib/guests";

/**
 * Client-side refresh endpoint. The dashboard's initial paint is fetched
 * server-side directly in the page component; this route exists so the
 * client component can poll for updates and manual refreshes without ever
 * knowing the real backend endpoint URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("k");

  if (!key) {
    return NextResponse.json({ error: "k is required" }, { status: 401 });
  }

  const result = await fetchGuests(key);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status || 502 });
  }

  return NextResponse.json(result.data);
}
