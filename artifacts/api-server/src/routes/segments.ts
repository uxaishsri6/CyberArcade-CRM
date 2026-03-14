import { Router, type IRouter } from "express";
import { db, segmentsTable, contactsTable } from "@workspace/db";
import { eq, and, or, gt, lt, gte, lte, ilike, isNull, isNotNull, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

function applySegmentFilters(filters: any) {
  const { match = "all", conditions = [] } = filters;
  const clauses: any[] = [];

  for (const cond of conditions) {
    const { field, operator, value } = cond;
    const col = (contactsTable as any)[field];
    if (!col) continue;

    let clause: any;
    switch (operator) {
      case "equals": clause = eq(col, value); break;
      case "not_equals": clause = sql`${col} != ${value}`; break;
      case "contains": clause = ilike(col, `%${value}%`); break;
      case "greater_than": clause = gt(col, value); break;
      case "less_than": clause = lt(col, value); break;
      case "gte": clause = gte(col, value); break;
      case "lte": clause = lte(col, value); break;
      case "is_empty": clause = isNull(col); break;
      case "not_empty": clause = isNotNull(col); break;
      default: continue;
    }
    if (clause) clauses.push(clause);
  }

  if (clauses.length === 0) return undefined;
  return match === "all" ? and(...clauses) : or(...clauses);
}

async function computeContactCount(filters: any): Promise<number> {
  try {
    const where = applySegmentFilters(filters);
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(contactsTable).where(where);
    return Number(result?.count ?? 0);
  } catch {
    return 0;
  }
}

function formatSegment(s: any) {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? null,
    filters: s.filters ?? {},
    contactCount: s.contactCount,
    color: s.color,
    createdAt: s.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

// GET /segments
router.get("/", async (_req, res) => {
  try {
    const segs = await db.select().from(segmentsTable).orderBy(segmentsTable.createdAt);
    res.json(segs.map(formatSegment));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /segments
router.post("/", async (req, res) => {
  try {
    const { name, description, filters, color } = req.body;
    const count = await computeContactCount(filters);
    const [seg] = await db.insert(segmentsTable).values({
      name,
      description: description ?? null,
      filters: filters ?? {},
      contactCount: count,
      color: color ?? "#00f5ff",
    }).returning();
    res.status(201).json(formatSegment(seg));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /segments/preview
router.post("/preview", async (req, res) => {
  try {
    const filters = req.body;
    const count = await computeContactCount(filters);
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /segments/:id
router.get("/:id", async (req, res) => {
  try {
    const [seg] = await db.select().from(segmentsTable).where(eq(segmentsTable.id, req.params.id));
    if (!seg) return res.status(404).json({ error: "Not found" });
    res.json(formatSegment(seg));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /segments/:id
router.patch("/:id", async (req, res) => {
  try {
    const { name, description, filters, color } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (filters) {
      updates.filters = filters;
      updates.contactCount = await computeContactCount(filters);
    }
    if (color) updates.color = color;

    const [seg] = await db.update(segmentsTable).set(updates).where(eq(segmentsTable.id, req.params.id)).returning();
    res.json(formatSegment(seg));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /segments/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.delete(segmentsTable).where(eq(segmentsTable.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /segments/:id/preview
router.post("/:id/preview", async (req, res) => {
  try {
    const filters = req.body;
    const count = await computeContactCount(filters);
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
