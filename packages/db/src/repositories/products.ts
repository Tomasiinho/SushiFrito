import { asc, eq } from "drizzle-orm";

import type { ProductDto } from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import { products } from "../schema";
import { mapProductDto } from "./mappers";

export async function getProducts(db: SushiFritoDb): Promise<ProductDto[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.isAvailable, true))
    .orderBy(asc(products.sortOrder), asc(products.name));

  return rows.map(mapProductDto);
}
