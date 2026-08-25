import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomTabBar } from "@/components/nav/BottomTabBar";
import { TransactionModalProvider } from "@/components/transaction/TransactionModalProvider";
import { createClient } from "@/lib/supabase/server";
import { getRemainingBudgetSummary } from "@/lib/budget-summary";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MoneyLog",
  description: "성완・예은 부부 공용 가계부",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyLog",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F9633F",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const remainingBudget = user ? await getRemainingBudgetSummary(supabase) : null;

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TransactionModalProvider>
          <Sidebar remainingBudget={remainingBudget} />
          <main className="pb-24 md:pb-0 md:pl-56">{children}</main>
          <BottomTabBar />
        </TransactionModalProvider>
      </body>
    </html>
  );
}
