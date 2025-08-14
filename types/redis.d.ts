declare module "redis" {
  export function createClient(options?: { url?: string }): {
    isOpen: boolean;
    connect: () => Promise<void>;
    lRange: (key: string, start: number, stop: number) => Promise<string[]>;
    lPush: (key: string, value: string) => Promise<number>;
    publish: (channel: string, message: string) => Promise<number>;
  };
}


