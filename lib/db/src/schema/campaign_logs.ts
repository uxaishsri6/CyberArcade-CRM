import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignLogsTable = pgTable("campaign_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull(),
  contactId: uuid("contact_id").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("sent"),
  sentAt: text("sent_at"),
  openedAt: text("opened_at"),
  clickedAt: text("clicked_at"),
  convertedAt: text("converted_at"),
});

export const insertCampaignLogSchema = createInsertSchema(campaignLogsTable).omit({ id: true });
export type InsertCampaignLog = z.infer<typeof insertCampaignLogSchema>;
export type CampaignLog = typeof campaignLogsTable.$inferSelect;
