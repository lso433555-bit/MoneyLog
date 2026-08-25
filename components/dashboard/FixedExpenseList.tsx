import { Inbox } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { MoneyAmount } from "./MoneyAmount";
import type { FixedExpenseItem } from "@/types/dashboard";

export function FixedExpenseList({ items }: { items: FixedExpenseItem[] }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">고정지출</h2>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-8 text-center">
          <Inbox size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">등록된 고정지출이 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
          {items.map((item) => (
            <li key={item.id} className="ml-card flex items-center gap-3 p-4">
              <CategoryBadge icon={item.category?.icon ?? ""} color={item.category?.color ?? "gray"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                <p className="truncate text-xs text-gray-500">{item.category?.name ?? "미분류"}</p>
              </div>
              <MoneyAmount value={item.amount} className="text-sm font-medium text-gray-900" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
