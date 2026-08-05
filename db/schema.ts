import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  email: text("email").notNull().unique(),
  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),

  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),

  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),

  generationDay: integer("generation_day").notNull(),
  dueDay: integer("due_day").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),

  subscriptionId: integer("subscription_id")
    .notNull()
    .references(() => subscriptions.id),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  token: text("token").notNull().unique(),
});

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),

    memberId: integer("member_id")
      .notNull()
      .references(() => members.id),

    amountCents: integer("amount_cents").notNull(),

    paymentMonth: text("payment_month").notNull(),

    dueDate: timestamp("due_date").notNull(),

    status: text("status").notNull(),

    paidAt: timestamp("paid_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    memberPaymentMonthUnique: unique().on(table.memberId, table.paymentMonth),
  }),
);

export const subscriptionRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [subscriptions.ownerId],
      references: [users.id],
    }),
    members: many(members),
  }),
);

export const memberRelations = relations(members, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [members.subscriptionId],
    references: [subscriptions.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const userRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  memberships: many(members),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  member: one(members, {
    fields: [payments.memberId],
    references: [members.id],
  }),
}));
