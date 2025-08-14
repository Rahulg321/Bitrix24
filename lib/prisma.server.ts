// lib/prisma.server.ts
import { Prisma, PrismaClient } from "@prisma/client";

const prismaClientSingleton = () =>
  new PrismaClient({
    log: ["info"],
  });

declare const globalThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prismaDB = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prismaDB;
}

/* -------------------------------------------------------------------------- */
/*                       Deal Version-History Middleware                      */
/* -------------------------------------------------------------------------- */

/**
 * Recursively remove Prisma-managed timestamp fields so they don’t trigger
 * false-positive diffs in history snapshots.
 */
function stripTimestampsDeep<T>(val: T): T {
  if (Array.isArray(val)) {
    // @ts-ignore – narrow to any[] for recursion then cast back to T
    return val.map((v) => stripTimestampsDeep(v)) as unknown as T;
  }
  if (val && typeof val === "object") {
    const obj: Record<string, any> = {};
    Object.entries(val as Record<string, any>).forEach(([k, v]) => {
      if (k === "createdAt" || k === "updatedAt") return;
      obj[k] = stripTimestampsDeep(v);
    });
    return obj as T;
  }
  return val;
}

// Models whose mutations should create a history snapshot for the parent Deal
const TRACKED_MODELS = [
  "Deal",
  "AiScreening",
  "SIM",
  "POC",
  "DealDocument",
] as const satisfies ReadonlyArray<Prisma.ModelName>;

const MUTATING_ACTIONS = [
  "create",
  "update",
  "upsert",
  "delete",
] as const satisfies ReadonlyArray<Prisma.MiddlewareParams["action"]>;

prismaDB.$use(async (params, next) => {
  const isTracked =
    (TRACKED_MODELS as readonly string[]).includes(params.model ?? "") &&
    (MUTATING_ACTIONS as readonly string[]).includes(params.action);

  let dealId: string | null = null;

  /* ---------------------- Determine affected dealId ---------------------- */
  if (isTracked) {
    if (params.model === "Deal") {
      // For Deal itself we know the id either from where or result
      if (params.action === "create") {
        // new deal – will get id from result later
      } else if (params.args?.where?.id) {
        dealId = params.args.where.id as string;
      }
    } else {
      // Child models contain dealId column
      if (params.action === "delete") {
        // Need to fetch existing row to read its dealId before deletion
        const existing: any = await (
          // @ts-ignore dynamic access to model delegate
          prismaDB[params.model!.charAt(0).toLowerCase() + params.model!.slice(1)].findUnique({
            where: { id: params.args.where.id as string },
          })
        );
        dealId = existing?.dealId ?? null;
      } else {
        // create/update/upsert
        dealId =
          (params.args?.data?.dealId as string | undefined) ??
          (params.args?.where?.dealId as string | undefined) ??
          null;
      }
    }
  }

  // Perform the actual DB mutation first
  const result = await next(params);

  if (isTracked) {
    // For Deal.create we now have the id in result
    if (!dealId && params.model === "Deal" && typeof result?.id === "string") {
      dealId = result.id;
    }

    if (dealId) {
      // Fetch a fresh, full snapshot of the deal including children
      const snapshot = await prismaDB.deal.findUnique({
        where: { id: dealId },
        include: {
          AiScreening: true,
          POC: true,
          DealDocument: true,
          SIM: true,
        },
      });

      if (snapshot) {
        const latest = await prismaDB.dealHistory.findFirst({
          where: { dealId },
          orderBy: { createdAt: "desc" },
        });

        const cleanedNew = stripTimestampsDeep(snapshot);
        const cleanedPrev = latest ? stripTimestampsDeep(latest.snapshot) : null;

        if (!cleanedPrev || JSON.stringify(cleanedPrev) !== JSON.stringify(cleanedNew)) {
          await prismaDB.dealHistory.create({
            data: {
              dealId,
              snapshot: cleanedNew,
            },
          });
        }
      }
    }
  }

  return result;
});

export default prismaDB;