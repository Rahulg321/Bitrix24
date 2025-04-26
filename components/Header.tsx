"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import { ChevronDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { IconType } from "react-icons/lib";

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
  { navlink: "/in-process",     navlabel: "In Process", icon: FiTrendingUp },
  { navlink: "/published-deals", navlabel: "Published", icon: FiCheckSquare },
  { navlink: "/infer", navlabel: "Screened", icon: FiSearch },
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

function NameLogo() {
  return (
    <Link
      href="/"
      aria-label="Home page"
      className="text-2xl font-bold text-primary transition-colors hover:text-primary/80"
    >
      Deal Sourcing
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
