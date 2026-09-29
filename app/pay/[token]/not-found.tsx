import { EmptyState } from "@/components/ui";

// Rendered when page.tsx calls notFound() for an unknown token.
export default function PaymentLinkNotFound() {
  return (
    <EmptyState title="Payment link not found">
      This link is invalid or has been removed. Ask whoever runs the
      subscription for a new one.
    </EmptyState>
  );
}
