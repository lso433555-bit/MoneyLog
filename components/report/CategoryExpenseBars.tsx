import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { MoneyAmount } from "@/components/dashboard/MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategoryColorClasses } from "@/lib/design/categoryColors";
import type { CategoryExpenseItem } from "@/types/report";

export function CategoryExpenseBars({ items }: { items: CategoryExpenseItem[] }) {
  if (items.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">카테고리별 지출</h2>
        <EmptyState message="이번 달 지출 내역이 없어요." />
      </section>
    );
  }

  // 금액 큰 순으로 이미 정렬되어 들어온다는 전제 — 첫 항목이 곧 최댓값.
  const maxAmount = items[0].amount;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">카테고리별 지출</h2>
      <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0 xl:grid-cols-3">
        {items.map((item) => {
          const width = maxAmount > 0 ? Math.max(4, Math.round((item.amount / maxAmount) * 100)) : 0;
          return (
            <div key={item.categoryId} className="ml-card p-4">
              <div className="flex items-center gap-3">
                <CategoryBadge icon={item.category.icon} color={item.category.color} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.category.name}
                </span>
                <MoneyAmount value={item.amount} className="text-sm font-medium text-gray-900 dark:text-gray-100" />
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full ${getCategoryColorClasses(item.category.color).bar}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
