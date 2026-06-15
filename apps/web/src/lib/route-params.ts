import { z } from "zod";

const idParamsSchema = z.object({
  id: z.string().min(1).max(128)
});

export interface IdRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function readRouteId(context: IdRouteContext): Promise<string> {
  const params = await context.params;
  return idParamsSchema.parse(params).id;
}
