import { HomeView } from "@/components/home-view";
import { loadTrackerSnapshot } from "@/lib/entries";
import { requirePageAccess } from "@/lib/session";

/**
 * Loads and renders today's tracker dashboard.
 */
export default async function HomePage() {
  await requirePageAccess();
  const snapshot = await loadTrackerSnapshot();
  return <HomeView snapshot={snapshot} />;
}
