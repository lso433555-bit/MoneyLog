import { Trophy } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { MoneyAmount } from "./MoneyAmount";
import { getCategoryColorClasses } from "@/lib/design/categoryColors";
import type { TopCategoryItem } from "@/types/dashboard";

export function TopCategoriesList({ items }: { items: TopCategoryItem[] }) {
  const maxAmount = items[0]?.amount ?? 0;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">이번 달 지출 TOP</h2>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-8 text-center dark:border-gray-700">
          <Trophy size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">아직 이번 달 지출이 없어요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const barColor = getCategoryColorClasses(item.category.color).bar;
            const progress = maxAmount > 0 ? Math.round((item.amount / maxAmount) * 100) : 0;

            return (
              <div key={item.category.name} className="ml-card flex items-center gap-3 p-4">
                <span className="w-4 shrink-0 text-center text-xs font-semibold tabular-nums text-gray-400">
                  {index + 1}
                </span>
                <CategoryBadge icon={item.category.icon} color={item.category.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{item.category.name}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <MoneyAmount value={item.amount} className="shrink-0 text-sm font-medium text-gray-900 dark:text-gray-100" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
