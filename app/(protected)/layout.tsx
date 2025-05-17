// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import MenuDialog from "@/components/Dialogs/menu-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/auth";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Dark Alpha Capital Deal Sourcing Organization",
  description: "Sourcing and Scrape Deals with AI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1️⃣ Fetch the session on the server
  const session = await auth();

  return (
    <html lang="en" className={cn(GeistSans.variable)} suppressHydrationWarning>
      <body className="antialiased">
        {/* 2️⃣ Wrap in SessionProvider and pass the session */}
        <SessionProvider session={session}>
          {/* 3️⃣ ThemeProvider is now a client component that handles its own props */}
          <ThemeProvider>
            <main>
              <MenuDialog />
              {/* 4️⃣ Header can also consume useSession() client-side */}
              <Header session={session} />
              {children}
              <Footer />
            </main>
          </ThemeProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
