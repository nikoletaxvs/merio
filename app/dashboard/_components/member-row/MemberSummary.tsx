import { Amount, Badge, Icon } from "@/components/ui";
import type { MemberPayment } from "./types";

/** The always-visible line of a member row: who they are and what they owe. */
export default function MemberSummary({
  name,
  email,
  current,
  open,
}: {
  name: string;
  email: string;
  current: MemberPayment | null;
  open: boolean;
}) {
  const isPaid = current?.status === "paid";

  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-strong font-mono text-xs font-medium text-muted">
          {initials(name)}
        </span>

        <div className="min-w-0">
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-sm text-muted">{email}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {current ? (
          <>
            <Amount cents={current.amountCents} className="hidden sm:inline" />

            <Badge tone={isPaid ? "success" : "pending"}>
              {isPaid ? "Paid" : "Owes"}
            </Badge>
          </>
        ) : (
          <span className="text-sm text-muted">No payment yet</span>
        )}

        <Icon
          name="chevronDown"
          className={`h-4 w-4 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
    </>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
