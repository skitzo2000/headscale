import { z } from 'zod';

export const brandColorsSchema = z.object({
  primary: z.string().default('#4F46E5'),
  secondary: z.string().default('#10B981'),
  background: z.string().default('#FFFFFF'),
  surface: z.string().default('#F9FAFB'),
  text: z.string().default('#111827'),
});

export const brandConfigSchema = z.object({
  name: z.string().default('Forms Platform'),
  logo: z.string().nullable().default(null),
  favicon: z.string().nullable().default(null),
  colors: brandColorsSchema.default({}),
  metadata: z.object({
    title: z.string().default('Forms Platform'),
    description: z.string().default('Create and share beautiful forms'),
  }).default({}),
  features: z.object({
    registration: z.boolean().default(true),
    publicForms: z.boolean().default(true),
    csvExport: z.boolean().default(true),
    responseNotifications: z.boolean().default(false),
  }).default({}),
});

export type BrandColors = z.infer<typeof brandColorsSchema>;
export type BrandConfig = z.infer<typeof brandConfigSchema>;

export const DEFAULT_BRAND: BrandConfig = brandConfigSchema.parse({});
