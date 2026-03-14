import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactsTable = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  city: text("city"),
  source: text("source").notNull().default("manual"),
  status: text("status").notNull().default("cold_lead"),
  childName: text("child_name"),
  childAge: integer("child_age"),
  childGrade: text("child_grade"),
  trialDate: text("trial_date"),
  trialAttended: boolean("trial_attended").notNull().default(false),
  trialBatch: text("trial_batch"),
  enrolledDate: text("enrolled_date"),
  enrolledCourse: text("enrolled_course"),
  tags: text("tags").array().notNull().default([]),
  leadScore: integer("lead_score").notNull().default(0),
  lastContactedAt: text("last_contacted_at"),
  notes: text("notes"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContactSchema = createInsertSchema(contactsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;
