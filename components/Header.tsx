"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { MdMenu, MdClose } from "react-icons/md";
import {
  FiPlus,
  FiList,
  FiCheckSquare,
  FiEdit,
  FiTrendingUp,
  FiSearch,
} from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon, ChevronDown, Lock } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { IconType } from "react-icons/lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaScrewdriver } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type HeaderProps = {
  className?: string;
  session: Session | null;
};

type NavLinkType = {
  navlink: string;
  navlabel: string;
  icon: any;
}[];

export const NavLinks: NavLinkType = [
  { navlink: "/new-deal", navlabel: "New", icon: FiPlus },
  { navlink: "/raw-deals", navlabel: "Raw", icon: FiList },
  { navlink: "/published-deals", navlabel: "Published", icon: FiCheckSquare },
  { navlink: "/screeners", navlabel: "Screener", icon: FaScrewdriver },
];

const Header = ({ className, session }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add admin-specific link if user is an admin
  const isAdmin = session?.user?.role === "ADMIN";
  const dynamicNavLinks = isAdmin
    ? [...NavLinks, { navlink: "/admin", navlabel: "Admin", icon: Lock }]
    : NavLinks;

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-md" : "bg-background",
        "border-b px-4 py-3 lg:px-8",
        className,
      )}
    >
      <nav aria-label="Main-navigation" className="mx-auto max-w-7xl">
        <ul className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <NameLogo />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(true)}
            >
              <MdMenu className="h-6 w-6" />
            </Button>
          </div>
          <DesktopMenu pathname={pathname} dyanmicLinks={dynamicNavLinks} />
          <div className="flex items-center space-x-4">
            <NotificationLink userId={session?.user.id as string} />
            {session ? <ProfileMenu session={session} /> : <AuthDialogNavs />}
          </div>
        </ul>
      </nav>
      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        pathname={pathname}
        dyanmicLinks={dynamicNavLinks}
      />
    </header>
  );
};

export default Header;

type PendingDeal = {
  id: string;
  title: string;
  ebitda: number;
  status: string;
};

type WebSocketMessage = {
  type: string;
  productId?: string;
  status?: string;
  userId?: string;
};

function NotificationLink({ userId }: { userId: string }) {
  const [deals, setDeals] = useState<PendingDeal[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(1000);
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch("/api/deals/pending");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: PendingDeal[] = await res.json();
      console.log("📊 Fetched deals:", data);
      setDeals(data);
    } catch (error) {
      console.error("❌ Error fetching deals:", error);
    }
  }, []);

  const fetchAndTransition = useCallback(() => {
    startTransition(() => {
      fetchDeals();
    });
  }, [fetchDeals]);

  useEffect(() => {
    fetchAndTransition();
  }, [fetchAndTransition]);

  const formatEbitda = (ebitda: number) => {
    if (ebitda >= 1000000) {
      return `$${(ebitda / 1000000).toFixed(1)}M`;
    } else if (ebitda >= 1000) {
      return `$${(ebitda / 1000).toFixed(1)}K`;
    }
    return `$${ebitda.toLocaleString()}`;
  };

  const connectWebSocket = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080";

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "register", userId }));
      retryDelayRef.current = 1000;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
    ws.onmessage = (e) => {
      try {
        const msg: WebSocketMessage = JSON.parse(e.data);
        if (msg.type === "new_screen_call") fetchAndTransition();
        if (msg.type === "problem_done" && msg.productId) fetchAndTransition();
      } catch {}
    };
    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) return;
      const delay = Math.min(retryDelayRef.current, 10000);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectWebSocket();
      }, delay);
      retryDelayRef.current = Math.min(delay * 2, 10000);
    };
    ws.onclose = () => {
      setWsConnected(false);
      scheduleReconnect();
    };
    ws.onerror = () => {
      setWsConnected(false);
      scheduleReconnect();
    };
  }, [userId, fetchAndTransition]);

  useEffect(() => {
    if (!userId) return;
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      retryDelayRef.current = 1000;
    };
  }, [userId, connectWebSocket]);

  return (
    <a href="/notifications">
      <button className="relative rounded-full p-2 transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <BellIcon className="size-5 text-foreground" />
        {deals.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full p-0 text-xs font-medium"
          >
            {/* Do some sort of sum of pending + (completed where not seen) */}
            {deals.length > 99 ? "99+" : deals.length}
          </Badge>
        )}
        <div
          className={cn(
            "absolute -bottom-0 -right-0 size-2 rounded-full",
            wsConnected ? "bg-green-500" : "bg-red-500",
          )}
        />
      </button>
    </a>
  );
}

function NameLogo() {
  return (
    <Link
      href="/"
      aria-label="Home page"
      className="text-2xl font-bold text-primary transition-colors hover:text-primary/80"
    >
      DAC DEALFLOW
    </Link>
  );
}

function DesktopMenu({
  pathname,
  dyanmicLinks,
}: {
  pathname: string;
  dyanmicLinks: NavLinkType;
}) {
  return (
    <div className="hidden space-x-1 md:flex">
      {dyanmicLinks.map((item, index) => (
        <Link
          href={item.navlink}
          key={index}
          className={clsx(
            "flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
            pathname === item.navlink
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.navlabel}</span>
        </Link>
      ))}
    </div>
  );
}

function MobileMenu({
  isOpen,
  setIsOpen,
  pathname,
  dyanmicLinks,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  pathname: string;
  dyanmicLinks: NavLinkType;
}) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden",
        isOpen ? "block" : "hidden",
      )}
    >
      <div className="fixed inset-y-0 right-0 w-full max-w-sm border-l bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <NameLogo />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setIsOpen(false)}
          >
            <MdClose className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            {dyanmicLinks.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.navlink}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === item.navlink
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.navlabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function AuthDialogNavs() {
  return (
    <div className="hidden space-x-4 md:flex md:items-center">
      <Link href={"/auth/login"}>Logout</Link>
    </div>
  );
}

function ProfileMenu({ session }: { session: Session }) {
  const router = useRouter();
  console.log("session", session);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src={session.user?.image || "https://github.com/shadcn.png"}
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="text-baseC flex items-center font-medium">
          Account <ChevronDown />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            router.push(`/profile/${session.user?.id}`);
          }}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            signOut();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
