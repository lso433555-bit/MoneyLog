import { Receipt } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { MoneyAmount } from "./MoneyAmount";
import { formatShortDateKo } from "@/lib/format";
import type { RecentTransactionItem } from "@/types/dashboard";

export function RecentTransactionList({ items }: { items: RecentTransactionItem[] }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">유동지출 · 최근</h2>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-8 text-center">
          <Receipt size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">아직 등록된 지출이 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-2">
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
              <MoneyAmount value={item.amount} forceNegative className="text-sm font-medium text-gray-900" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
