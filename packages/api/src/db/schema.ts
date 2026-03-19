import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  settings: jsonb("settings").default({}),
  brandId: varchar("brand_id", { length: 100 }).default("default"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  formId: integer("form_id")
    .references(() => forms.id)
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  label: varchar("label", { length: 500 }).notNull(),
  description: text("description"),
  options: jsonb("options"),
  required: boolean("required").default(false),
  order: integer("order").notNull(),
  validation: jsonb("validation"),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id")
    .references(() => forms.id)
    .notNull(),
  respondentEmail: varchar("respondent_email", { length: 255 }),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id")
    .references(() => responses.id)
    .notNull(),
  fieldId: integer("field_id")
    .references(() => fields.id)
    .notNull(),
  value: jsonb("value").notNull(),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  forms: many(forms),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
  fields: many(fields),
  responses: many(responses),
}));

export const fieldsRelations = relations(fields, ({ one }) => ({
  form: one(forms, {
    fields: [fields.formId],
    references: [forms.id],
  }),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  form: one(forms, {
    fields: [responses.formId],
    references: [forms.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, {
    fields: [answers.responseId],
    references: [responses.id],
  }),
  field: one(fields, {
    fields: [answers.fieldId],
    references: [fields.id],
  }),
}));
