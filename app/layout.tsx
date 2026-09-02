import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomTabBar } from "@/components/nav/BottomTabBar";
import { TransactionModalProvider } from "@/components/transaction/TransactionModalProvider";
import { createClient } from "@/lib/supabase/server";
import { getRemainingBudgetSummary } from "@/lib/budget-summary";
import { getMyHouseholdId } from "@/lib/household";
import { ensureRecurringForViewedMonth } from "@/lib/recurring";
import { getCurrentMonthRange } from "@/lib/date";

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
  // 사이드바는 모든 페이지에 항상 떠 있어서, 홈/전체내역/리포트처럼 이번 달 고정지출
  // 자동생성을 거치는 화면을 거치지 않고 /settings나 /recurring으로 바로 들어와도
  // "이번 달 남은 예산" 숫자가 고정지출 반영 전 상태로 보이지 않도록 여기서도 보장한다.
  if (user) {
    const { year, month } = getCurrentMonthRange();
    await ensureRecurringForViewedMonth(supabase, { userId: user.id, year, month });
  }
  const remainingBudget = user ? await getRemainingBudgetSummary(supabase) : null;
  const householdId = user ? await getMyHouseholdId(supabase) : null;

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TransactionModalProvider householdId={householdId}>
          <Sidebar remainingBudget={remainingBudget} />
          <main className="pb-24 md:pb-0 md:pl-56">{children}</main>
          <BottomTabBar />
        </TransactionModalProvider>
      </body>
    </html>
  );
}
