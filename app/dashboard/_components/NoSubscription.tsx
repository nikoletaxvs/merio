import { EmptyState } from "@/components/ui";

/** Shown on the dashboard before the owner has a subscription. */
export default function NoSubscription() {
  return (
    <EmptyState title="No subscription yet">
      Once a subscription exists, its members and payments show up here.
    </EmptyState>
  );
}
