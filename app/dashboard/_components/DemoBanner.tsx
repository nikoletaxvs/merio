import { Button } from "@/components/ui";
import { resetDemo } from "../_actions/session";

/** Explains the demo deployment and lets visitors restore the sample data. */
export default function DemoBanner() {
  return (
    <div className="border-b border-border bg-surface-muted">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 text-sm sm:px-6">
        <p className="flex-1 text-muted">
          <span className="font-medium text-foreground">Demo.</span> Sample
          data, reset every night. Emails are logged, not sent. Open a member
          below to see their pay page.
        </p>

        <form action={resetDemo}>
          <Button type="submit" variant="secondary" size="sm">
            Reset data
          </Button>
        </form>
      </div>
    </div>
  );
}
