import { limiters } from "@/lib/rate-limit";


declare global {
  interface Function {
    __ratelimit?: (name: keyof typeof limiters) => any;
  }
}
export {};
