"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useTransactionModal } from "@/components/transaction/TransactionModalProvider";

export function BottomTabBar() {
  const pathname = usePathname();
  const { openModal } = useTransactionModal();
  const [home, ...rest] = NAV_ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
      <TabLink item={home} active={pathname === home.href} />

      <div className="flex flex-1 flex-col items-center gap-1 py-2">
        <button
          type="button"
          onClick={() => openModal("expense")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
        >
          <Plus size={18} />
        </button>
        <span className="text-[11px] text-gray-500">입력</span>
      </div>

      {rest.map((item) => (
        <TabLink key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function TabLink({ item, active }: { item: (typeof NAV_ITEMS)[number]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] transition-colors ${
        active ? "text-gray-900 dark:text-gray-100" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.25 : 2} />
      <span>{item.label}</span>
    </Link>
  );
}
