import "server-only";

export interface Guest {
  name: string;
  phone: string;
  email: string;
  /** Absent/empty for weddings without sides (a general RSVP). */
  side?: string;
  /** null = unknown — older forms never asked, so never read it as "not attending". */
  attending: boolean | null;
  createdAt: string | null;
}

export interface GuestSide {
  key: string;
  label: string;
}

export interface AttendingCounts {
  yes: number;
  no: number;
  unknown: number;
}

export interface GuestCounts {
  total: number;
  bySide: Record<string, number>;
  attending: AttendingCounts;
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

  const data = normalizePayload((await res.json()) as GuestsPayload);
  return { ok: true, data };
}

/**
 * Tolerates a backend that predates the RSVP fields (no `attending` on
 * guests, no `counts.attending`): missing answers become null ("unknown"),
 * never false, and the counts are derived from the guest list.
 */
function normalizePayload(data: GuestsPayload): GuestsPayload {
  const guests = data.guests.map((guest) => ({
    ...guest,
    attending: typeof guest.attending === "boolean" ? guest.attending : null,
  }));
  const attending = data.counts.attending ?? {
    yes: guests.filter((guest) => guest.attending === true).length,
    no: guests.filter((guest) => guest.attending === false).length,
    unknown: guests.filter((guest) => guest.attending === null).length,
  };
  return { ...data, sides: data.sides ?? [], guests, counts: { ...data.counts, attending } };
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
