import { CategoryBadge } from "./CategoryBadge";
import { MoneyAmount } from "./MoneyAmount";
import { getCategoryColorClasses } from "@/lib/design/categoryColors";
import type { CategoryBudgetItem } from "@/types/dashboard";

// 80% 이상 경고(앰버), 100% 이상 초과(레드) — PRD 4.5.
function getBudgetStatus(spent: number, limit: number): "ok" | "warning" | "over" {
  if (limit <= 0) return "ok";
  const ratio = spent / limit;
  if (ratio >= 1) return "over";
  if (ratio >= 0.8) return "warning";
  return "ok";
}

export function CategoryBudgetList({ items }: { items: CategoryBudgetItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">카테고리별 예산</h2>
      <div className="space-y-2">
        {items.map((item) => {
          const status = getBudgetStatus(item.spent, item.limit);
          const progress = item.limit > 0 ? Math.min(100, Math.round((item.spent / item.limit) * 100)) : 0;
          const barColor =
            status === "over" ? "bg-red-500" : status === "warning" ? "bg-amber-500" : getCategoryColorClasses(item.category.color).bar;
          const amountColor =
            status === "over"
              ? "text-red-600"
              : status === "warning"
                ? "text-amber-600 dark:text-amber-400"
                : "text-gray-900 dark:text-gray-100";

          return (
            <div key={item.categoryId} className="ml-card p-4">
              <div className="flex items-center gap-3">
                <CategoryBadge icon={item.category.icon} color={item.category.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{item.category.name}</p>
                  {status === "over" && <p className="truncate text-xs font-medium text-red-600">예산 초과</p>}
                </div>
              </div>
              <p
                aria-live={status === "over" ? "polite" : undefined}
                className={`mt-2 whitespace-nowrap text-sm font-medium ${amountColor}`}
              >
                <MoneyAmount value={item.spent} />
                <span className="text-gray-400"> / </span>
                <MoneyAmount value={item.limit} className="text-gray-500" />
                {status === "over" && <span className="sr-only"> 예산을 초과했습니다</span>}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className={`h-full rounded-full transition-[width] duration-300 ${barColor}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
