// Dev-only stand-in for the real `guests` Cloud Function, so the dashboard
// can be built/previewed/screenshotted without touching production
// Firestore. Implements the same GET contract: k (secret key), format.
// The key alone identifies the wedding — accepts any key equal to DEV_KEY.
import { createServer } from "node:http";

const PORT = 8787;
const DEV_KEY = "dev-key";
const COUPLE_NAMES = "Afriyie & Jeremy";
const SIDES = [
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

function makeGuest(firstNames, side, n, i) {
  const first = firstNames[n % firstNames.length];
  const last = LAST_NAMES[Math.floor(n / firstNames.length) % LAST_NAMES.length];
  return {
    name: `${first} ${last}`,
    phone: i % 3 === 0 ? "" : `+233 24 000 0${i}${i}${i}`,
    email: i % 4 === 0 ? `${first.split(" ")[0].toLowerCase()}@example.com` : "",
    side,
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
  };
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
  const header = "name,phone,email,side,createdAt";
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((g) => [g.name, g.phone, g.email, g.side, g.createdAt].map(esc).join(","));
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

  const counts = { total: guests.length, bySide: {} };
  for (const g of guests) counts.bySide[g.side] = (counts.bySide[g.side] || 0) + 1;

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ coupleNames: COUPLE_NAMES, sides: SIDES, guests, counts }));
}).listen(PORT, () => {
  console.log(`Mock guests endpoint running at http://localhost:${PORT}/guests`);
  console.log(`Dev key: ${DEV_KEY}`);
});
