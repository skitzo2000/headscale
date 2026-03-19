import { readFileSync } from 'fs';
import { resolve } from 'path';
import { brandConfigSchema, DEFAULT_BRAND, type BrandConfig } from './schema.js';

export function loadBrandConfig(brandId: string = 'default', brandsDir?: string): BrandConfig {
  const dir = brandsDir || resolve(process.cwd(), '../../brands');
  const configPath = resolve(dir, brandId, 'brand.json');

  try {
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return brandConfigSchema.parse(parsed);
  } catch {
    console.warn(`Brand config not found at ${configPath}, using defaults`);
    return DEFAULT_BRAND;
  }
}

export function getBrandId(): string {
  return process.env.BRAND || 'default';
}
