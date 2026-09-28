export type MemberPayment = {
  id: number;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  paidAt: Date | null;
};

export type MemberRowData = {
  id: number;
  token: string;
  user: { name: string; email: string };
  payments: MemberPayment[];
};
