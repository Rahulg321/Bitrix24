import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Dark Alpha Capital Deal Sourcing Organization",
  description: "Sourcing and Scrape Deals with AI",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(poppins.variable)}>
      <body className={`antialiased`}>
        <main>
          <div>{children}</div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
