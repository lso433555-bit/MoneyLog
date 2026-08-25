import Link from "next/link";
import { Receipt } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { MoneyAmount } from "./MoneyAmount";
import { formatShortDateKo } from "@/lib/format";
import type { RecentTransactionItem } from "@/types/dashboard";

export function RecentTransactionList({ items }: { items: RecentTransactionItem[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">유동지출 · 최근</h2>
        <Link href="/transactions" className="text-xs font-medium text-gray-400 hover:text-gray-600">
          전체보기
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-8 text-center">
          <Receipt size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">아직 등록된 지출이 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
          {items.map((item) => (
            <li key={item.id} className="ml-card flex items-center gap-3 p-4">
              <CategoryBadge icon={item.category?.icon ?? ""} color={item.category?.color ?? "gray"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {item.memo || item.category?.name || "지출"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {formatShortDateKo(item.date)} · {item.category?.name ?? "미분류"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {item.enteredBy && <span className="text-[10px] text-gray-400">{item.enteredBy}</span>}
                <MoneyAmount value={item.amount} className="text-sm font-medium text-gray-900" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
