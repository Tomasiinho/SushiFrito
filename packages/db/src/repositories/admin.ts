import { asc } from "drizzle-orm";

import {
  adminPickupBlockSchema,
  adminPickupZoneSchema,
  adminProductSchema,
  type PickupBlockDto,
  type PickupZoneDto,
  type ProductDto,
} from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import { pickupBlocks, pickupZones, products } from "../schema";
import { mapProductDto } from "./mappers";

export async function listAdminProducts(
  db: SushiFritoDb,
): Promise<ProductDto[]> {
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.name));

  return rows.map(mapProductDto);
}

export async function upsertAdminProduct(
  db: SushiFritoDb,
  input: unknown,
): Promise<ProductDto> {
  const parsed = adminProductSchema.parse(input);
  const now = new Date();
  const [row] = await db
    .insert(products)
    .values({
      category: parsed.category,
      description: parsed.description,
      imageUrl: parsed.imageUrl ?? null,
      isAvailable: parsed.isAvailable,
      name: parsed.name,
      price: parsed.price,
      slug: parsed.slug,
      sortOrder: parsed.sortOrder,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        category: parsed.category,
        description: parsed.description,
        imageUrl: parsed.imageUrl ?? null,
        isAvailable: parsed.isAvailable,
        name: parsed.name,
        price: parsed.price,
        sortOrder: parsed.sortOrder,
        updatedAt: now,
      },
      target: products.slug,
    })
    .returning();

  if (row === undefined) {
    throw new Error("Product upsert failed");
  }

  return mapProductDto(row);
}

export async function getPickupSchedule(
  db: SushiFritoDb,
  includeInactive = false,
): Promise<PickupZoneDto[]> {
  const zoneRows = await db
    .select()
    .from(pickupZones)
    .orderBy(asc(pickupZones.sortOrder), asc(pickupZones.name));
  const blockRows = await db
    .select()
    .from(pickupBlocks)
    .orderBy(asc(pickupBlocks.sortOrder), asc(pickupBlocks.start));

  return zoneRows
    .filter((zone) => includeInactive || zone.isActive)
    .map((zone) => ({
      blocks: blockRows
        .filter(
          (block) =>
            block.zoneId === zone.id && (includeInactive || block.isActive),
        )
        .map(mapPickupBlock),
      description: zone.description,
      id: zone.id,
      isActive: zone.isActive,
      name: zone.name,
      sortOrder: zone.sortOrder,
    }));
}

export async function upsertPickupZone(
  db: SushiFritoDb,
  input: unknown,
): Promise<PickupZoneDto> {
  const parsed = adminPickupZoneSchema.parse(input);
  const now = new Date();

  await db
    .insert(pickupZones)
    .values({
      description: parsed.description,
      id: parsed.id,
      isActive: parsed.isActive,
      name: parsed.name,
      sortOrder: parsed.sortOrder,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        description: parsed.description,
        isActive: parsed.isActive,
        name: parsed.name,
        sortOrder: parsed.sortOrder,
        updatedAt: now,
      },
      target: pickupZones.id,
    });

  const zones = await getPickupSchedule(db, true);
  const zone = zones.find((candidate) => candidate.id === parsed.id);

  if (zone === undefined) {
    throw new Error("Pickup zone upsert failed");
  }

  return zone;
}

export async function upsertPickupBlock(
  db: SushiFritoDb,
  input: unknown,
): Promise<PickupBlockDto> {
  const parsed = adminPickupBlockSchema.parse(input);
  const now = new Date();

  await db
    .insert(pickupBlocks)
    .values({
      end: parsed.end,
      id: parsed.id,
      isActive: parsed.isActive,
      label: parsed.label,
      sortOrder: parsed.sortOrder,
      start: parsed.start,
      subtitle: parsed.subtitle,
      updatedAt: now,
      zoneId: parsed.zone,
    })
    .onConflictDoUpdate({
      set: {
        end: parsed.end,
        isActive: parsed.isActive,
        label: parsed.label,
        sortOrder: parsed.sortOrder,
        start: parsed.start,
        subtitle: parsed.subtitle,
        updatedAt: now,
        zoneId: parsed.zone,
      },
      target: pickupBlocks.id,
    });

  return {
    end: parsed.end,
    id: parsed.id,
    isActive: parsed.isActive,
    label: parsed.label,
    sortOrder: parsed.sortOrder,
    start: parsed.start,
    subtitle: parsed.subtitle,
    zone: parsed.zone,
  };
}

function mapPickupBlock(
  block: typeof pickupBlocks.$inferSelect,
): PickupBlockDto {
  return {
    end: block.end,
    id: block.id,
    isActive: block.isActive,
    label: block.label,
    sortOrder: block.sortOrder,
    start: block.start,
    subtitle: block.subtitle,
    zone: block.zoneId,
  };
}
