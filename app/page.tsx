import { DashboardGate } from "@/components/DashboardGate";

/**
 * The only route. There is no tenant/hostname/slug resolution — the secret
 * key in `k` alone identifies the wedding, and the backend returns that
 * wedding's data directly. The hostname a couple's link uses is cosmetic.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  return <DashboardGate secretKey={k} />;
}
