import { Badge, Button, Icon, MerioMark } from "@/components/ui";
import { logout } from "../_actions/session";

export default function DashboardHeader({
  name,
  familyName,
  photoUrl,
  paidByMember,
  showSignOut,
}: {
  name: string;
  familyName: string | null;
  photoUrl: string | null;
  /** One entry per member: has this member paid the current period? */
  paidByMember: { id: number; paid: boolean }[];
  showSignOut: boolean;
}) {
  const paidCount = paidByMember.filter((member) => member.paid).length;
  const total = paidByMember.length;
  const allPaid = total > 0 && paidCount === total;

  return (
    <header>
      <div className="flex items-start gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
          />
        ) : (
          <MerioMark className="h-12 w-12 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-3xl font-medium">
            {familyName ?? name}
          </h1>
          {familyName && <p className="mt-0.5 text-sm text-muted">{name}</p>}
        </div>

        {showSignOut && (
          <form action={logout} className="shrink-0">
            <Button type="submit" variant="ghost" size="sm">
              <Icon name="logout" className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </form>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <p className="text-muted">
            <span className="font-mono font-medium text-foreground">{paidCount}</span>{" "}
            of{" "}
            <span className="font-mono font-medium text-foreground">{total}</span>{" "}
            paid this period
          </p>

          {allPaid && <Badge tone="success">All settled</Badge>}
        </div>

        {/* One cell per member, like ticks in a ledger column. */}
        <div className="mt-3 flex gap-1" aria-hidden="true">
          {paidByMember.map((member) => (
            <span
              key={member.id}
              className={`h-2 flex-1 rounded-sm ${
                member.paid ? "bg-accent" : "border border-border-strong"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
