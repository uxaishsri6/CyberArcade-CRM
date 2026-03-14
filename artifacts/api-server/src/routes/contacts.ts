import { Router, type IRouter } from "express";
import { db, contactsTable, activitiesTable, campaignLogsTable, campaignsTable, segmentsTable } from "@workspace/db";
import { eq, and, or, ilike, sql, desc, gte, lte, inArray } from "drizzle-orm";

const router: IRouter = Router();

function formatContact(c: any) {
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone ?? null,
    whatsapp: c.whatsapp ?? null,
    city: c.city ?? null,
    source: c.source,
    status: c.status,
    childName: c.childName ?? null,
    childAge: c.childAge ?? null,
    childGrade: c.childGrade ?? null,
    trialDate: c.trialDate ?? null,
    trialAttended: c.trialAttended,
    trialBatch: c.trialBatch ?? null,
    enrolledDate: c.enrolledDate ?? null,
    enrolledCourse: c.enrolledCourse ?? null,
    tags: c.tags ?? [],
    leadScore: c.leadScore,
    lastContactedAt: c.lastContactedAt ?? null,
    notes: c.notes ?? null,
    assignedTo: c.assignedTo ?? null,
    createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: c.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

// GET /contacts
router.get("/", async (req, res) => {
  try {
    const { status, source, trialAttended, search, page = "1", limit = "25", minLeadScore, maxLeadScore, city, tags } = req.query as any;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 25;
    const offset = (pageNum - 1) * limitNum;

    let conditions: any[] = [];
    if (status) {
      const statuses = status.split(",");
      conditions.push(inArray(contactsTable.status, statuses));
    }
    if (source) {
      const sources = source.split(",");
      conditions.push(inArray(contactsTable.source, sources));
    }
    if (trialAttended !== undefined && trialAttended !== "") {
      conditions.push(eq(contactsTable.trialAttended, trialAttended === "true"));
    }
    if (search) {
      conditions.push(
        or(
          ilike(contactsTable.firstName, `%${search}%`),
          ilike(contactsTable.lastName, `%${search}%`),
          ilike(contactsTable.email, `%${search}%`),
          ilike(contactsTable.phone, `%${search}%`)
        )
      );
    }
    if (minLeadScore !== undefined) {
      conditions.push(gte(contactsTable.leadScore, parseInt(minLeadScore)));
    }
    if (maxLeadScore !== undefined) {
      conditions.push(lte(contactsTable.leadScore, parseInt(maxLeadScore)));
    }
    if (city) {
      conditions.push(ilike(contactsTable.city, `%${city}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [allContacts, countResult] = await Promise.all([
      db.select().from(contactsTable).where(where).orderBy(desc(contactsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({
      contacts: allContacts.map(formatContact),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /contacts
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const [contact] = await db.insert(contactsTable).values({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone ?? null,
      whatsapp: body.whatsapp ?? null,
      city: body.city ?? null,
      source: body.source ?? "manual",
      status: body.status ?? "cold_lead",
      childName: body.childName ?? null,
      childAge: body.childAge ?? null,
      childGrade: body.childGrade ?? null,
      trialDate: body.trialDate ?? null,
      trialAttended: body.trialAttended ?? false,
      trialBatch: body.trialBatch ?? null,
      enrolledDate: body.enrolledDate ?? null,
      enrolledCourse: body.enrolledCourse ?? null,
      tags: body.tags ?? [],
      leadScore: body.leadScore ?? 0,
      notes: body.notes ?? null,
      assignedTo: body.assignedTo ?? null,
    }).returning();
    res.status(201).json(formatContact(contact));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contacts/export
router.get("/export", async (_req, res) => {
  try {
    const contacts = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
    const header = "id,firstName,lastName,email,phone,status,source,leadScore,trialAttended,city,createdAt";
    const rows = contacts.map(c =>
      [c.id, c.firstName, c.lastName, c.email, c.phone ?? "", c.status, c.source, c.leadScore, c.trialAttended, c.city ?? "", c.createdAt?.toISOString()].join(",")
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
    res.send([header, ...rows].join("\n"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /contacts/bulk
router.patch("/bulk", async (req, res) => {
  try {
    const { ids, status, tags, campaignId } = req.body;
    if (!ids || ids.length === 0) return res.json({ updated: 0 });

    const updates: any = {};
    if (status) updates.status = status;
    if (tags) updates.tags = tags;

    let updated = 0;
    if (Object.keys(updates).length > 0) {
      await db.update(contactsTable).set(updates).where(inArray(contactsTable.id, ids));
      updated = ids.length;
    }

    if (campaignId) {
      const campaign = await db.select().from(campaignsTable).where(eq(campaignsTable.id, campaignId)).limit(1);
      if (campaign.length > 0) {
        const logValues = ids.map((contactId: string) => ({
          campaignId,
          contactId,
          channel: "email",
          status: "sent" as const,
          sentAt: new Date().toISOString(),
        }));
        await db.insert(campaignLogsTable).values(logValues);
        updated = ids.length;
      }
    }

    res.json({ updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contacts/:id
router.get("/:id", async (req, res) => {
  try {
    const [contact] = await db.select().from(contactsTable).where(eq(contactsTable.id, req.params.id));
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json(formatContact(contact));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /contacts/:id
router.patch("/:id", async (req, res) => {
  try {
    const body = req.body;
    const oldContact = await db.select().from(contactsTable).where(eq(contactsTable.id, req.params.id)).limit(1);
    if (oldContact.length === 0) return res.status(404).json({ error: "Not found" });

    const updates: any = {};
    const allowed = ["firstName", "lastName", "email", "phone", "whatsapp", "city", "source", "status", "childName", "childAge", "childGrade", "trialDate", "trialAttended", "trialBatch", "enrolledDate", "enrolledCourse", "tags", "leadScore", "notes", "assignedTo", "lastContactedAt"];
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (body.status && body.status !== oldContact[0].status) {
      await db.insert(activitiesTable).values({
        contactId: req.params.id,
        type: "status_change",
        description: `Status changed from ${oldContact[0].status} to ${body.status}`,
        createdBy: "system",
      });
      if (body.status === "enrolled") {
        await db.insert(activitiesTable).values({
          contactId: req.params.id,
          type: "enrolled",
          description: `Contact enrolled in ${body.enrolledCourse ?? "CyberArcade program"}`,
          createdBy: "system",
        });
      }
    }

    const [updated] = await db.update(contactsTable).set(updates).where(eq(contactsTable.id, req.params.id)).returning();
    res.json(formatContact(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /contacts/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.delete(contactsTable).where(eq(contactsTable.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contacts/:id/activities
router.get("/:id/activities", async (req, res) => {
  try {
    const acts = await db.select().from(activitiesTable).where(eq(activitiesTable.contactId, req.params.id)).orderBy(desc(activitiesTable.createdAt));
    res.json(acts.map(a => ({
      id: a.id,
      contactId: a.contactId,
      type: a.type,
      description: a.description,
      createdAt: a.createdAt?.toISOString() ?? new Date().toISOString(),
      createdBy: a.createdBy ?? null,
      contactName: null,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /contacts/:id/activities
router.post("/:id/activities", async (req, res) => {
  try {
    const { type, description, createdBy } = req.body;
    const [act] = await db.insert(activitiesTable).values({
      contactId: req.params.id,
      type,
      description,
      createdBy: createdBy ?? null,
    }).returning();

    await db.update(contactsTable).set({ lastContactedAt: new Date().toISOString() }).where(eq(contactsTable.id, req.params.id));

    res.status(201).json({
      id: act.id,
      contactId: act.contactId,
      type: act.type,
      description: act.description,
      createdAt: act.createdAt?.toISOString() ?? new Date().toISOString(),
      createdBy: act.createdBy ?? null,
      contactName: null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contacts/:id/campaigns
router.get("/:id/campaigns", async (req, res) => {
  try {
    const logs = await db.select({
      log: campaignLogsTable,
      campaign: campaignsTable,
    })
      .from(campaignLogsTable)
      .leftJoin(campaignsTable, eq(campaignLogsTable.campaignId, campaignsTable.id))
      .where(eq(campaignLogsTable.contactId, req.params.id))
      .orderBy(desc(campaignLogsTable.sentAt));

    res.json(logs.map(({ log, campaign }) => ({
      id: log.id,
      campaignId: log.campaignId,
      contactId: log.contactId,
      contactName: null,
      contactEmail: null,
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

export default router;
