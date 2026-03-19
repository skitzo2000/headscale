import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { forms, fields, responses, answers } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const submitSchema = z.object({
  answers: z.array(
    z.object({
      fieldId: z.number(),
      value: z.unknown(),
    }),
  ),
  respondentEmail: z.string().email().optional(),
});

// POST /forms/:formId/submit — PUBLIC
router.post("/forms/:formId/submit", async (req, res) => {
  try {
    const formId = Number(req.params.formId);
    const body = submitSchema.parse(req.body);

    // Check form exists and is published
    const [form] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.isPublished, true)))
      .limit(1);

    if (!form) {
      res.status(404).json({ error: "Form not found or not published" });
      return;
    }

    // Get form fields to validate required fields
    const formFields = await db
      .select()
      .from(fields)
      .where(eq(fields.formId, formId));

    const requiredFieldIds = formFields
      .filter((f) => f.required)
      .map((f) => f.id);

    const answeredFieldIds = new Set(body.answers.map((a) => a.fieldId));

    const missingRequired = requiredFieldIds.filter(
      (id) => !answeredFieldIds.has(id),
    );

    if (missingRequired.length > 0) {
      res.status(400).json({
        error: "Missing required fields",
        missingFieldIds: missingRequired,
      });
      return;
    }

    // Create response
    const [response] = await db
      .insert(responses)
      .values({
        formId,
        respondentEmail: body.respondentEmail,
      })
      .returning();

    // Create answers
    if (body.answers.length > 0) {
      await db.insert(answers).values(
        body.answers.map((a) => ({
          responseId: response.id,
          fieldId: a.fieldId,
          value: a.value,
        })),
      );
    }

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    console.error("Submit response error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /forms/:formId/responses — AUTHENTICATED
router.get("/forms/:formId/responses", authMiddleware, async (req, res) => {
  try {
    const formId = Number(req.params.formId);

    // Verify form ownership
    const [form] = await db
      .select()
      .from(forms)
      .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
      .limit(1);

    if (!form) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    const formResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.formId, formId))
      .orderBy(desc(responses.submittedAt));

    // Get answers for all responses
    const responseIds = formResponses.map((r) => r.id);
    const allAnswers =
      responseIds.length > 0
        ? await db.select().from(answers)
        : [];

    // Filter answers by response IDs and group
    const answersMap = new Map<number, (typeof allAnswers)[number][]>();
    for (const answer of allAnswers) {
      if (responseIds.includes(answer.responseId)) {
        const existing = answersMap.get(answer.responseId) ?? [];
        existing.push(answer);
        answersMap.set(answer.responseId, existing);
      }
    }

    const result = formResponses.map((r) => ({
      ...r,
      answers: answersMap.get(r.id) ?? [],
    }));

    res.json(result);
  } catch (error) {
    console.error("List responses error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /forms/:formId/responses/export/csv — AUTHENTICATED
router.get(
  "/forms/:formId/responses/export/csv",
  authMiddleware,
  async (req, res) => {
    try {
      const formId = Number(req.params.formId);

      // Verify form ownership
      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
        .limit(1);

      if (!form) {
        res.status(404).json({ error: "Form not found" });
        return;
      }

      // Get fields for column headers
      const formFields = await db
        .select()
        .from(fields)
        .where(eq(fields.formId, formId))
        .orderBy(fields.order);

      // Get all responses with answers
      const formResponses = await db
        .select()
        .from(responses)
        .where(eq(responses.formId, formId))
        .orderBy(desc(responses.submittedAt));

      const allAnswers =
        formResponses.length > 0
          ? await db.select().from(answers)
          : [];

      // Build CSV
      const headers = [
        "Response ID",
        "Respondent Email",
        "Submitted At",
        ...formFields.map((f) => f.label),
      ];

      const escapeCsv = (val: string): string => {
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };

      const rows = formResponses.map((r) => {
        const responseAnswers = allAnswers.filter(
          (a) => a.responseId === r.id,
        );
        const answerMap = new Map(
          responseAnswers.map((a) => [a.fieldId, a.value]),
        );

        return [
          String(r.id),
          r.respondentEmail ?? "",
          r.submittedAt?.toISOString() ?? "",
          ...formFields.map((f) => {
            const val = answerMap.get(f.id);
            if (val === undefined || val === null) return "";
            if (typeof val === "object") return JSON.stringify(val);
            return String(val);
          }),
        ];
      });

      const csv = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="form-${formId}-responses.csv"`,
      );
      res.send(csv);
    } catch (error) {
      console.error("Export CSV error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /forms/:formId/responses/:responseId — AUTHENTICATED
router.get(
  "/forms/:formId/responses/:responseId",
  authMiddleware,
  async (req, res) => {
    try {
      const formId = Number(req.params.formId);
      const responseId = Number(req.params.responseId);

      // Verify form ownership
      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.id, formId), eq(forms.userId, req.userId!)))
        .limit(1);

      if (!form) {
        res.status(404).json({ error: "Form not found" });
        return;
      }

      const [response] = await db
        .select()
        .from(responses)
        .where(
          and(eq(responses.id, responseId), eq(responses.formId, formId)),
        )
        .limit(1);

      if (!response) {
        res.status(404).json({ error: "Response not found" });
        return;
      }

      const responseAnswers = await db
        .select()
        .from(answers)
        .where(eq(answers.responseId, responseId));

      res.json({ ...response, answers: responseAnswers });
    } catch (error) {
      console.error("Get response error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
