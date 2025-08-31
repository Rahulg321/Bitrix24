import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const limiters = {
  global:         new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, "1 m") }),
  dealsRead:      new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, "1 m") }),
  search:         new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, "1 m") }),
  comments:       new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, "1 m") }),
  authSignin:     new Ratelimit({ redis, limiter: Ratelimit.fixedWindow (5,  "1 m") }),
  authForgot:     new Ratelimit({ redis, limiter: Ratelimit.fixedWindow (5,  "1 h") }),
  authSession:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 m") }),
  dealsCreate:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),
  dealsUpdate:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m") }),
  dealsDelete:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,  "1 m") }),
  dealsStatus:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 m") }),
  aiAnalyze:      new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,  "1 m") }),
  fileUpload:     new Ratelimit({ redis, limiter: Ratelimit.fixedWindow (10, "1 h") }),
  notifications:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 m") }),
  admin:          new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,  "1 m") }),
};

export async function enforce(limiter: Ratelimit, key: string | undefined) {
  const id = key ?? "anonymous";
  const { success, limit, remaining, reset } = await limiter.limit(id);
  return {
    ok: success,
    headers: {
      "X-RateLimit-Limit":      String(limit),
      "X-RateLimit-Remaining":  String(remaining),
      "X-RateLimit-Reset":      String(reset),
    },
  };
}
