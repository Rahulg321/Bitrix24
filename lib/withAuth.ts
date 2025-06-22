/* eslint-disable @typescript-eslint/no-misused-promises */
import { auth }               from "@/auth";
import { getUserById }        from "./queries";
import { User }               from "@prisma/client";
import { limiters, enforce }  from "@/lib/rate-limit";

async function getUser(): Promise<User | undefined> {
  const session = await auth();
  if (!session) return undefined;

  const dbUser = await getUserById(session.user.id!);     // returns User|null
  return dbUser ?? undefined;
}


type RLFunc<F> = F & {
  __ratelimit: (name: keyof typeof limiters) => RLFunc<F>;
};

export function withAuth(
  handler: (req: Request, user: User) => Promise<Response>,
): RLFunc<(req: Request) => Promise<Response>> {
  const wrapped = (async (req: Request) => {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lim = (handler as any).__rl as keyof typeof limiters | undefined;
    if (lim) {
      const { ok, headers } = await enforce(limiters[lim], user.id);
      if (!ok) return new Response("Too many requests", { status: 429, headers });
    }

    return handler(req, user);
  }) as RLFunc<(req: Request) => Promise<Response>>;

  wrapped.__ratelimit = (name) => {
    (handler as any).__rl = name;
    return wrapped;
  };

  return wrapped;
}

export function withAuthServerAction<TArgs extends any[], TReturn>(
  handler: (user: User, ...args: TArgs) => Promise<TReturn>,
): RLFunc<(...args: TArgs) => Promise<TReturn | { error: string }>> {
  let limiter: keyof typeof limiters | undefined;

  const action = (async (...args: TArgs) => {
    const user = await getUser();
    if (!user) return { error: "Unauthorized" };

    if (limiter) {
      const { ok } = await enforce(limiters[limiter], user.id);
      if (!ok) return { error: "Too many requests" };
    }

    try {
      return await handler(user, ...args);
    } catch (err) {
      console.error("[Action error]", err);
      return {
        error:
          err instanceof Error ? err.message : "Unexpected error in action",
      };
    }
  }) as RLFunc<(...args: TArgs) => Promise<any>>;

  action.__ratelimit = (name) => {
    limiter = name;
    return action;
  };

  return action;
}
