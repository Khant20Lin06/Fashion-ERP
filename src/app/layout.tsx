import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// `next/font/google` (Geist/Geist Mono) previously lived here but requires
// fetching font files from fonts.googleapis.com at build time — this fails
// in network-restricted build environments (CI, offline Docker builds) with
// no local fallback. We are not intentionally pinned to the Geist family, so
// rather than vendoring binary font files or adding a new dependency, the
// `--font-geist-sans` / `--font-geist-mono` CSS variables Tailwind's theme
// reads (see globals.css) are now defined as deterministic system font
// stacks directly in CSS — no JS font loader, no network access, and no
// per-element class needed since the variables are set globally.

export const metadata: Metadata = {
  title: "Fashion ERP/POS",
  description: "Enterprise Fashion ERP/POS Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
