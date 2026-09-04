import { fetchGuests } from "@/lib/guests";
import { InvalidKeyScreen } from "./InvalidKeyScreen";
import { LoadErrorScreen } from "./LoadErrorScreen";
import { DashboardClient } from "./DashboardClient";

/**
 * Server-side auth + first-paint fetch. The secret key alone is checked
 * against the real backend before any guest data is ever rendered — an
 * invalid or missing key never reaches the guest list, even for a flash of
 * a frame.
 */
export async function DashboardGate({ secretKey }: { secretKey?: string }) {
  if (!secretKey) {
    return <InvalidKeyScreen />;
  }

  const result = await fetchGuests(secretKey);

  if (!result.ok) {
    if (result.status === 401 || result.status === 403) {
      return <InvalidKeyScreen />;
    }
    return <LoadErrorScreen />;
  }

  return <DashboardClient secretKey={secretKey} initialData={result.data} />;
}
