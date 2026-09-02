import Link from "next/link";
import { Receipt } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { MoneyAmount } from "./MoneyAmount";
import { formatShortDateKo } from "@/lib/format";
import type { RecentTransactionItem } from "@/types/dashboard";

export function RecentTransactionList({ items }: { items: RecentTransactionItem[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">유동지출 · 최근</h2>
        {items.length > 0 && (
          <Link
            href="/transactions"
            className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            전체보기
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-8 text-center dark:border-gray-700">
          <Receipt size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">아직 등록된 지출이 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
          {items.map((item) => (
            <li key={item.id} className="ml-card flex items-center gap-3 p-4">
              <CategoryBadge icon={item.category?.icon ?? ""} color={item.category?.color ?? "gray"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.memo || item.category?.name || "지출"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {formatShortDateKo(item.date)} · {item.category?.name ?? "미분류"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {item.enteredBy && <span className="text-[10px] text-gray-400">{item.enteredBy}</span>}
                <MoneyAmount value={item.amount} className="text-sm font-medium text-gray-900 dark:text-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
