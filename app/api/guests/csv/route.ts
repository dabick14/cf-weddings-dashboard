import { NextRequest, NextResponse } from "next/server";
import { fetchGuestsCsv } from "@/lib/guests";

/** Same-origin proxy for the "Export guest list (CSV)" action, so the client never sees the real backend URL. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("k");

  if (!key) {
    return NextResponse.json({ error: "k is required" }, { status: 401 });
  }

  const upstream = await fetchGuestsCsv(key);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Could not export guest list" }, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guests.csv"`,
    },
  });
}
