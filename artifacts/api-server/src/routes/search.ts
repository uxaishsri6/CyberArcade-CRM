import { Router, type IRouter } from "express";
import { db, contactsTable, campaignsTable, segmentsTable } from "@workspace/db";
import { or, ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { q } = req.query as any;
    if (!q || q.length < 2) return res.json({ contacts: [], campaigns: [], segments: [] });

    const [contacts, campaigns, segments] = await Promise.all([
      db.select().from(contactsTable).where(
        or(
          ilike(contactsTable.firstName, `%${q}%`),
          ilike(contactsTable.lastName, `%${q}%`),
          ilike(contactsTable.email, `%${q}%`)
        )
      ).limit(5),
      db.select().from(campaignsTable).where(ilike(campaignsTable.name, `%${q}%`)).limit(5),
      db.select().from(segmentsTable).where(ilike(segmentsTable.name, `%${q}%`)).limit(5),
    ]);

    res.json({
      contacts: contacts.map(c => ({
        id: c.id, firstName: c.firstName, lastName: c.lastName, email: c.email,
        phone: c.phone ?? null, whatsapp: c.whatsapp ?? null, city: c.city ?? null,
        source: c.source, status: c.status, childName: c.childName ?? null, childAge: c.childAge ?? null,
        childGrade: c.childGrade ?? null, trialDate: c.trialDate ?? null, trialAttended: c.trialAttended,
        trialBatch: c.trialBatch ?? null, enrolledDate: c.enrolledDate ?? null, enrolledCourse: c.enrolledCourse ?? null,
        tags: c.tags ?? [], leadScore: c.leadScore, lastContactedAt: c.lastContactedAt ?? null,
        notes: c.notes ?? null, assignedTo: c.assignedTo ?? null,
        createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: c.updatedAt?.toISOString() ?? new Date().toISOString(),
      })),
      campaigns: campaigns.map(c => ({
        id: c.id, name: c.name, goal: c.goal, status: c.status, channels: c.channels ?? [],
        segmentId: c.segmentId ?? null, segmentName: null, scheduledAt: c.scheduledAt ?? null,
        subject: c.subject ?? null, messageBody: c.messageBody ?? null, ctaText: c.ctaText ?? null,
        ctaUrl: c.ctaUrl ?? null, sentCount: c.sentCount, openCount: c.openCount, clickCount: c.clickCount,
        replyCount: c.replyCount, conversionCount: c.conversionCount,
        createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      segments: segments.map(s => ({
        id: s.id, name: s.name, description: s.description ?? null, filters: s.filters ?? {},
        contactCount: s.contactCount, color: s.color,
        createdAt: s.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
