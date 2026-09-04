import "server-only";

export interface Guest {
  name: string;
  phone: string;
  email: string;
  side: string;
  createdAt: string | null;
}

export interface GuestSide {
  key: string;
  label: string;
}

export interface GuestCounts {
  total: number;
  bySide: Record<string, number>;
}

export interface GuestsPayload {
  coupleNames: string;
  sides: GuestSide[];
  guests: Guest[];
  counts: GuestCounts;
}

export type GuestsResult =
  | { ok: true; data: GuestsPayload }
  | { ok: false; status: number; message: string };

/**
 * Base URL of the `guests` fetch Cloud Function, e.g.
 * https://us-central1-cfweddingslive.cloudfunctions.net/guests
 *
 * Server-only — never exposed to the client. This app never talks to
 * Firestore directly; every read goes through this HTTP endpoint.
 */
function endpointUrl(): string {
  const base = process.env.GUESTS_ENDPOINT_URL;
  if (!base) {
    throw new Error("GUESTS_ENDPOINT_URL is not set — see README for local/deploy setup.");
  }
  return base;
}

/**
 * Fetches the wedding + guest list + counts for one couple. The secret key
 * alone identifies the wedding — there is no separate slug or tenant lookup.
 */
export async function fetchGuests(key: string): Promise<GuestsResult> {
  const url = new URL(endpointUrl());
  url.searchParams.set("k", key);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    return { ok: false, status: 0, message: "network error" };
  }

  if (!res.ok) {
    const message = await safeErrorMessage(res);
    return { ok: false, status: res.status, message };
  }

  const data = (await res.json()) as GuestsPayload;
  return { ok: true, data };
}

/**
 * Streams the CSV export straight from the backend. Returns the raw
 * Response so a route handler can forward its body + headers untouched.
 */
export async function fetchGuestsCsv(key: string): Promise<Response> {
  const url = new URL(endpointUrl());
  url.searchParams.set("k", key);
  url.searchParams.set("format", "csv");

  return fetch(url, { cache: "no-store" });
}

async function safeErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? `request failed with status ${res.status}`;
  } catch {
    return `request failed with status ${res.status}`;
  }
}
