import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomTabBar } from "@/components/nav/BottomTabBar";
import { TransactionModalProvider } from "@/components/transaction/TransactionModalProvider";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TransactionModalProvider>
          <Sidebar />
          <main className="pb-24 md:pb-0 md:pl-56">{children}</main>
          <BottomTabBar />
        </TransactionModalProvider>
      </body>
    </html>
  );
}
