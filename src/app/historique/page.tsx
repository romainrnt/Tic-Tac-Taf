import { HistoryView } from "@/components/history-view";
import { loadTrackerSnapshot } from "@/lib/entries";
import { requirePageAccess } from "@/lib/session";

/**
 * Loads and renders the punch history grouped by week.
 */
export default async function HistoryPage() {
  await requirePageAccess();
  const snapshot = await loadTrackerSnapshot();
  return <HistoryView snapshot={snapshot} />;
}
