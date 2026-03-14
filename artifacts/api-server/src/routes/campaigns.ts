import { Router, type IRouter } from "express";
import { db, campaignsTable, campaignLogsTable, contactsTable, segmentsTable, activitiesTable } from "@workspace/db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

const router: IRouter = Router();

function formatCampaign(c: any, segmentName?: string) {
  return {
    id: c.id,
    name: c.name,
    goal: c.goal,
    status: c.status,
    channels: c.channels ?? [],
    segmentId: c.segmentId ?? null,
    segmentName: segmentName ?? null,
    scheduledAt: c.scheduledAt ?? null,
    subject: c.subject ?? null,
    messageBody: c.messageBody ?? null,
    ctaText: c.ctaText ?? null,
    ctaUrl: c.ctaUrl ?? null,
    sentCount: c.sentCount,
    openCount: c.openCount,
    clickCount: c.clickCount,
    replyCount: c.replyCount,
    conversionCount: c.conversionCount,
    createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

// GET /campaigns
router.get("/", async (req, res) => {
  try {
    const { status } = req.query as any;
    let campaigns;
    if (status && status !== "all") {
      campaigns = await db.select().from(campaignsTable).where(eq(campaignsTable.status, status)).orderBy(desc(campaignsTable.createdAt));
    } else {
      campaigns = await db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt));
    }

    const segmentIds = campaigns.filter(c => c.segmentId).map(c => c.segmentId!);
    let segmentMap: Record<string, string> = {};
    if (segmentIds.length > 0) {
      const segs = await db.select().from(segmentsTable).where(inArray(segmentsTable.id, segmentIds));
      for (const s of segs) segmentMap[s.id] = s.name;
    }

    res.json(campaigns.map(c => formatCampaign(c, c.segmentId ? segmentMap[c.segmentId] : undefined)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /campaigns
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const [campaign] = await db.insert(campaignsTable).values({
      name: body.name,
      goal: body.goal ?? "enroll_trial",
      status: body.status ?? "draft",
      channels: body.channels ?? [],
      segmentId: body.segmentId ?? null,
      scheduledAt: body.scheduledAt ?? null,
      subject: body.subject ?? null,
      messageBody: body.messageBody ?? null,
      ctaText: body.ctaText ?? null,
      ctaUrl: body.ctaUrl ?? null,
    }).returning();
    res.status(201).json(formatCampaign(campaign));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /campaigns/:id
router.get("/:id", async (req, res) => {
  try {
    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, req.params.id));
    if (!campaign) return res.status(404).json({ error: "Not found" });
    let segmentName: string | undefined;
    if (campaign.segmentId) {
      const [seg] = await db.select().from(segmentsTable).where(eq(segmentsTable.id, campaign.segmentId));
      segmentName = seg?.name;
    }
    res.json(formatCampaign(campaign, segmentName));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /campaigns/:id
router.patch("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updates: any = {};
    const allowed = ["name", "goal", "status", "channels", "segmentId", "scheduledAt", "subject", "messageBody", "ctaText", "ctaUrl", "sentCount", "openCount", "clickCount", "replyCount", "conversionCount"];
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    const [campaign] = await db.update(campaignsTable).set(updates).where(eq(campaignsTable.id, req.params.id)).returning();
    res.json(formatCampaign(campaign));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /campaigns/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.delete(campaignLogsTable).where(eq(campaignLogsTable.campaignId, req.params.id));
    await db.delete(campaignsTable).where(eq(campaignsTable.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /campaigns/:id/launch
router.post("/:id/launch", async (req, res) => {
  try {
    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, req.params.id));
    if (!campaign) return res.status(404).json({ error: "Not found" });

    let contacts: any[] = [];
    if (campaign.segmentId) {
      contacts = await db.select().from(contactsTable);
    } else {
      contacts = await db.select().from(contactsTable).limit(50);
    }

    const sentCount = contacts.length * (campaign.channels?.length ?? 1);
    const openCount = Math.floor(sentCount * 0.35);
    const clickCount = Math.floor(sentCount * 0.12);
    const conversionCount = Math.floor(sentCount * 0.04);

    const logValues = [];
    for (const contact of contacts.slice(0, 20)) {
      for (const channel of (campaign.channels ?? ["email"])) {
        const isOpened = Math.random() > 0.65;
        const isClicked = isOpened && Math.random() > 0.7;
        const isConverted = isClicked && Math.random() > 0.8;
        logValues.push({
          campaignId: campaign.id,
          contactId: contact.id,
          channel,
          status: isConverted ? "converted" : isClicked ? "clicked" : isOpened ? "opened" : "delivered",
          sentAt: new Date().toISOString(),
          openedAt: isOpened ? new Date().toISOString() : null,
          clickedAt: isClicked ? new Date().toISOString() : null,
          convertedAt: isConverted ? new Date().toISOString() : null,
        });
      }
    }
    if (logValues.length > 0) {
      await db.insert(campaignLogsTable).values(logValues);
    }

    const [updated] = await db.update(campaignsTable).set({
      status: "active",
      sentCount,
      openCount,
      clickCount,
      conversionCount,
    }).where(eq(campaignsTable.id, req.params.id)).returning();

    res.json(formatCampaign(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /campaigns/:id/pause
router.post("/:id/pause", async (req, res) => {
  try {
    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, req.params.id));
    if (!campaign) return res.status(404).json({ error: "Not found" });
    const newStatus = campaign.status === "paused" ? "active" : "paused";
    const [updated] = await db.update(campaignsTable).set({ status: newStatus }).where(eq(campaignsTable.id, req.params.id)).returning();
    res.json(formatCampaign(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /campaigns/:id/duplicate
router.post("/:id/duplicate", async (req, res) => {
  try {
    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, req.params.id));
    if (!campaign) return res.status(404).json({ error: "Not found" });
    const [dup] = await db.insert(campaignsTable).values({
      name: `${campaign.name} (Copy)`,
      goal: campaign.goal,
      status: "draft",
      channels: campaign.channels,
      segmentId: campaign.segmentId,
      subject: campaign.subject,
      messageBody: campaign.messageBody,
      ctaText: campaign.ctaText,
      ctaUrl: campaign.ctaUrl,
    }).returning();
    res.status(201).json(formatCampaign(dup));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /campaigns/:id/logs
router.get("/:id/logs", async (req, res) => {
  try {
    const { status } = req.query as any;
    let logsQuery = db
      .select({ log: campaignLogsTable, contact: contactsTable })
      .from(campaignLogsTable)
      .leftJoin(contactsTable, eq(campaignLogsTable.contactId, contactsTable.id))
      .where(eq(campaignLogsTable.campaignId, req.params.id));

    const logs = await logsQuery;
    const filtered = status ? logs.filter(l => l.log.status === status) : logs;

    res.json(filtered.map(({ log, contact }) => ({
      id: log.id,
      campaignId: log.campaignId,
      contactId: log.contactId,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
      contactEmail: contact?.email ?? null,
      channel: log.channel,
      status: log.status,
      sentAt: log.sentAt ?? null,
      openedAt: log.openedAt ?? null,
      clickedAt: log.clickedAt ?? null,
      convertedAt: log.convertedAt ?? null,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /campaigns/:id/timeline
router.get("/:id/timeline", async (req, res) => {
  try {
    const logs = await db.select().from(campaignLogsTable).where(eq(campaignLogsTable.campaignId, req.params.id));

    const byDate: Record<string, { opens: number; clicks: number; conversions: number }> = {};
    for (const log of logs) {
      if (log.openedAt) {
        const d = log.openedAt.substring(0, 10);
        if (!byDate[d]) byDate[d] = { opens: 0, clicks: 0, conversions: 0 };
        byDate[d].opens++;
      }
      if (log.clickedAt) {
        const d = log.clickedAt.substring(0, 10);
        if (!byDate[d]) byDate[d] = { opens: 0, clicks: 0, conversions: 0 };
        byDate[d].clicks++;
      }
      if (log.convertedAt) {
        const d = log.convertedAt.substring(0, 10);
        if (!byDate[d]) byDate[d] = { opens: 0, clicks: 0, conversions: 0 };
        byDate[d].conversions++;
      }
    }

    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
    res.json(sorted.map(([date, vals]) => ({ date, ...vals })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
