import { Router } from "express";
import { eq, and, desc, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { forms, fields, responses, answers } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

const createFormSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
});

const updateFormSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  settings: z.record(z.unknown()).optional(),
  isPublished: z.boolean().optional(),
});

const fieldTypeEnum = z.enum([
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "dropdown",
  "number",
  "email",
  "date",
]);

const createFieldSchema = z.object({
  type: fieldTypeEnum,
  label: z.string().min(1).max(500),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  validation: z.record(z.unknown()).optional(),
});

const updateFieldSchema = z.object({
  type: fieldTypeEnum.optional(),
  label: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  options: z.array(z.string()).nullable().optional(),
  required: z.boolean().optional(),
  validation: z.record(z.unknown()).nullable().optional(),
});

const reorderFieldsSchema = z.object({
  fieldIds: z.array(z.number()),
});

// GET / — list forms owned by current user
router.get("/", async (req, res) => {
  try {
    const userForms = await db
      .select()
      .from(forms)
      .where(eq(forms.userId, req.userId!))
      .orderBy(desc(forms.updatedAt));

    res.json(userForms);
  } catch (error) {
    console.error("List forms error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST / — create form
router.post("/", async (req, res) => {
  try {
    const body = createFormSchema.parse(req.body);

    const [form] = await db
      .insert(forms)
      .values({
        userId: req.userId!,
        title: body.title,
        description: body.description,
      })
      .returning();

    res.status(201).json(form);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Create form error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id — get form with fields
router.get("/:id", async (req, res) => {
  try {
    const formId = Number(req.params.id);

    const [form] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!form) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    const formFields = await db
      .select()
      .from(fields)
      .where(eq(fields.formId, formId))
      .orderBy(fields.order);

    res.json({ ...form, fields: formFields });
  } catch (error) {
    console.error("Get form error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /:id — update form
router.put("/:id", async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const body = updateFormSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    const [updated] = await db
      .update(forms)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(forms.id, formId))
      .returning();

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Update form error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id — delete form with cascade
router.delete("/:id", async (req, res) => {
  try {
    const formId = Number(req.params.id);

    const [existing] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    // Get response IDs for this form to delete answers
    const formResponses = await db
      .select({ id: responses.id })
      .from(responses)
      .where(eq(responses.formId, formId));

    const responseIds = formResponses.map((r) => r.id);

    if (responseIds.length > 0) {
      for (const responseId of responseIds) {
        await db.delete(answers).where(eq(answers.responseId, responseId));
      }
      await db.delete(responses).where(eq(responses.formId, formId));
    }

    await db.delete(fields).where(eq(fields.formId, formId));
    await db.delete(forms).where(eq(forms.id, formId));

    res.status(204).send();
  } catch (error) {
    console.error("Delete form error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /:id/fields — add field to form
router.post("/:id/fields", async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const body = createFieldSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    // Get max order for this form
    const [maxOrder] = await db
      .select({ maxOrder: max(fields.order) })
      .from(fields)
      .where(eq(fields.formId, formId));

    const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

    const [field] = await db
      .insert(fields)
      .values({
        formId,
        type: body.type,
        label: body.label,
        description: body.description,
        options: body.options,
        required: body.required,
        validation: body.validation,
        order: nextOrder,
      })
      .returning();

    res.status(201).json(field);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Create field error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /:id/fields/reorder — reorder fields (must be before /:fieldId route)
router.put("/:id/fields/reorder", async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const body = reorderFieldsSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    for (let i = 0; i < body.fieldIds.length; i++) {
      await db
        .update(fields)
        .set({ order: i })
        .where(and(eq(fields.id, body.fieldIds[i]), eq(fields.formId, formId)));
    }

    const updatedFields = await db
      .select()
      .from(fields)
      .where(eq(fields.formId, formId))
      .orderBy(fields.order);

    res.json(updatedFields);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Reorder fields error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /:id/fields/:fieldId — update field
router.put("/:id/fields/:fieldId", async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const fieldId = Number(req.params.fieldId);
    const body = updateFieldSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    const [updated] = await db
      .update(fields)
      .set(body)
      .where(and(eq(fields.id, fieldId), eq(fields.formId, formId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Field not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Update field error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id/fields/:fieldId — delete field
router.delete("/:id/fields/:fieldId", async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const fieldId = Number(req.params.fieldId);

    const [existing] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    const [deleted] = await db
      .delete(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.formId, formId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Field not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Delete field error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
