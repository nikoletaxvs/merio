import { MerioMark } from "@/components/ui";

// Rendered when page.tsx calls notFound() for an unknown token.
export default function PaymentLinkNotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <MerioMark className="h-10 w-10" />

        <h1 className="mt-6 font-display text-2xl font-medium">
          Payment link not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          This link is invalid or has been removed. Ask whoever runs the
          subscription for a new one.
        </p>
      </div>
    </main>
  );
}
