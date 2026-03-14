import { Router, type IRouter } from "express";
import { db, contactsTable, campaignsTable, activitiesTable, campaignLogsTable } from "@workspace/db";
import { eq, desc, sql, gte, lt, and, lte } from "drizzle-orm";

const router: IRouter = Router();

// GET /dashboard/stats
router.get("/stats", async (_req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalContacts] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable);
    const [trialAttendees] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(eq(contactsTable.trialAttended, true));
    const [activeCampaigns] = await db.select({ count: sql<number>`count(*)` }).from(campaignsTable).where(eq(campaignsTable.status, "active"));
    const [enrolled] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(eq(contactsTable.status, "enrolled"));
    const [totalLeads] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable);
    const [pendingFollowUps] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(
      sql`(${contactsTable.lastContactedAt} IS NULL OR ${contactsTable.lastContactedAt} < ${sevenDaysAgo}) AND ${contactsTable.status} NOT IN ('enrolled', 'churned')`
    );

    const total = Number(totalLeads.count) || 1;
    const enrolledCount = Number(enrolled.count) || 0;
    const conversionRate = Math.round((enrolledCount / total) * 100);

    res.json({
      totalContacts: Number(totalContacts.count),
      trialAttendees: Number(trialAttendees.count),
      activeCampaigns: Number(activeCampaigns.count),
      conversionsThisMonth: enrolledCount,
      overallConversionRate: conversionRate,
      pendingFollowUps: Number(pendingFollowUps.count),
      totalContactsChange: 12,
      trialAttendeesChange: 8,
      activeCampaignsChange: 0,
      conversionsChange: 25,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/funnel
router.get("/funnel", async (_req, res) => {
  try {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable);
    const [invited] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(sql`${contactsTable.status} IN ('trial_attended', 'interested', 'enrolled')`);
    const [attended] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(eq(contactsTable.trialAttended, true));
    const [interested] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(sql`${contactsTable.status} IN ('interested', 'enrolled')`);
    const [enrolledCount] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(eq(contactsTable.status, "enrolled"));

    const totalVal = Number(total.count) || 1;
    const stages = [
      { name: "Total Leads", count: Number(total.count) },
      { name: "Trial Invited", count: Number(invited.count) },
      { name: "Trial Attended", count: Number(attended.count) },
      { name: "Interested", count: Number(interested.count) },
      { name: "Enrolled", count: Number(enrolledCount.count) },
    ];

    const result = stages.map((s, i) => {
      const prev = i === 0 ? s.count : stages[i - 1].count;
      const dropOff = prev > 0 ? Math.round(((prev - s.count) / prev) * 100) : 0;
      return { name: s.name, count: s.count, dropOffPercent: dropOff };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/campaign-performance
router.get("/campaign-performance", async (_req, res) => {
  try {
    const campaigns = await db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt)).limit(6);
    res.json(campaigns.map(c => ({
      name: c.name.length > 20 ? c.name.substring(0, 20) + "..." : c.name,
      sent: c.sentCount,
      opened: c.openCount,
      clicked: c.clickCount,
      converted: c.conversionCount,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/lead-sources
router.get("/lead-sources", async (_req, res) => {
  try {
    const result = await db
      .select({ source: contactsTable.source, count: sql<number>`count(*)` })
      .from(contactsTable)
      .groupBy(contactsTable.source);
    res.json(result.map(r => ({ source: r.source, count: Number(r.count) })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /dashboard/recent-activities
router.get("/recent-activities", async (_req, res) => {
  try {
    const acts = await db
      .select({ act: activitiesTable, contact: contactsTable })
      .from(activitiesTable)
      .leftJoin(contactsTable, eq(activitiesTable.contactId, contactsTable.id))
      .orderBy(desc(activitiesTable.createdAt))
      .limit(20);

    res.json(acts.map(({ act, contact }) => ({
      id: act.id,
      contactId: act.contactId,
      type: act.type,
      description: act.description,
      createdAt: act.createdAt?.toISOString() ?? new Date().toISOString(),
      createdBy: act.createdBy ?? null,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
