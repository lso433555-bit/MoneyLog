"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useTransactionModal } from "@/components/transaction/TransactionModalProvider";
import { MoneyAmount } from "@/components/dashboard/MoneyAmount";

export function Sidebar({ remainingBudget }: { remainingBudget: number | null }) {
  const pathname = usePathname();
  const { openModal } = useTransactionModal();
  const [home, ...rest] = NAV_ITEMS;

  return (
    <nav className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col gap-1 border-r border-gray-200 bg-white p-4 md:flex">
      <p className="mb-4 px-3 font-mono text-lg font-semibold text-gray-900">MoneyLog</p>

      {remainingBudget !== null && (
        <div className="mb-4 rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-[11px] text-gray-400">이번 달 남은 예산</p>
          <MoneyAmount value={remainingBudget} warnOnNegative className="text-base font-semibold text-gray-900" />
        </div>
      )}

      <SidebarLink item={home} active={pathname === home.href} />

      <button
        type="button"
        onClick={() => openModal("expense")}
        className="flex items-center gap-3 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Plus size={18} />
        입력
      </button>

      {rest.map((item) => (
        <SidebarLink key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function SidebarLink({ item, active }: { item: (typeof NAV_ITEMS)[number]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl border-l-2 py-2 pl-[10px] pr-3 text-sm transition-colors ${
        active
          ? "border-coral-500 bg-gray-100 font-medium text-gray-900"
          : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}
