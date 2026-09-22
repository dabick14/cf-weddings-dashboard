// Dev-only stand-in for the real `guests` Cloud Function, so the dashboard
// can be built/previewed/screenshotted without touching production
// Firestore. Implements the same GET contract: k (secret key), format.
// The key alone identifies the wedding — accepts any key equal to DEV_KEY.
//
// MOCK_NO_SIDES=1 serves a general-RSVP wedding instead (sides: [], no
// `side` on guests, attending answered yes/no or unknown).
import { createServer } from "node:http";

const PORT = 8787;
const DEV_KEY = "dev-key";
const NO_SIDES = process.env.MOCK_NO_SIDES === "1";
const COUPLE_NAMES = NO_SIDES ? "Ofori & Beverly" : "Afriyie & Jeremy";
const SIDES = NO_SIDES
  ? []
  : [
      { key: "afriyie", label: "Afriyie" },
      { key: "jeremy", label: "Jeremy" },
    ];

const GUESTS_PER_SIDE = 125;

const BRIDE_FIRST_NAMES = [
  "Nana Ama", "Efua", "Abena", "Adjoa", "Akosua", "Ama", "Yaa", "Afia",
  "Akua", "Abla", "Esi", "Adwoa", "Baaba",
];
const GROOM_FIRST_NAMES = [
  "Kojo", "Yaw", "Kwabena", "Kwame", "Kwaku", "Kofi", "Kwadwo", "Fiifi",
  "Kwesi", "Ebo", "Kobina", "Kwabla",
];
const LAST_NAMES = [
  "Owusu", "Mensah", "Boateng", "Darko", "Sarpong", "Osei", "Frimpong",
  "Antwi", "Asante", "Adjei", "Appiah", "Agyemang", "Boakye", "Yeboah", "Amoah",
];

// Sides weddings predate RSVPs, so their guests are all "unknown" (null),
// matching real legacy rows; the no-sides wedding mixes all three answers.
function makeGuest(firstNames, side, n, i) {
  const first = firstNames[n % firstNames.length];
  const last = LAST_NAMES[Math.floor(n / firstNames.length) % LAST_NAMES.length];
  const guest = {
    name: `${first} ${last}`,
    phone: i % 3 === 0 ? "" : `+233 24 000 0${i}${i}${i}`,
    email: i % 4 === 0 ? `${first.split(" ")[0].toLowerCase()}@example.com` : "",
    attending: NO_SIDES ? [true, true, true, false, null][i % 5] : null,
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
  };
  if (!NO_SIDES) guest.side = side;
  return guest;
}

// Interleave the two sides (rather than one full block per side) so
// createdAt order — and therefore the "All" tab — mixes both sides
// realistically, the way real RSVPs actually arrive.
const guests = [];
for (let n = 0; n < GUESTS_PER_SIDE; n++) {
  guests.push(makeGuest(BRIDE_FIRST_NAMES, "afriyie", n, n * 2));
  guests.push(makeGuest(GROOM_FIRST_NAMES, "jeremy", n, n * 2 + 1));
}
guests.reverse();

function toCsv(rows) {
  const header = "name,phone,email,attending,side,createdAt";
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const answer = (a) => (a === true ? "yes" : a === false ? "no" : "");
  const body = rows.map((g) =>
    [g.name, g.phone, g.email, answer(g.attending), g.side, g.createdAt].map(esc).join(",")
  );
  return [header, ...body].join("\n");
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const key = url.searchParams.get("k");
  const format = url.searchParams.get("format");

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (key !== DEV_KEY) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid key" }));
    return;
  }

  if (format === "csv") {
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guests.csv"`,
    });
    res.end(toCsv(guests));
    return;
  }

  const counts = { total: guests.length, bySide: {}, attending: { yes: 0, no: 0, unknown: 0 } };
  for (const g of guests) {
    if (g.side) counts.bySide[g.side] = (counts.bySide[g.side] || 0) + 1;
    counts.attending[g.attending === true ? "yes" : g.attending === false ? "no" : "unknown"] += 1;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ coupleNames: COUPLE_NAMES, sides: SIDES, guests, counts }));
}).listen(PORT, () => {
  console.log(`Mock guests endpoint running at http://localhost:${PORT}/guests`);
  console.log(`Dev key: ${DEV_KEY}`);
});
