import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { MoneyAmount } from "@/components/dashboard/MoneyAmount";
import type { CategoryIncreaseItem } from "@/types/report";

export function TopIncreasesCallout({ items }: { items: CategoryIncreaseItem[] }) {
  return (
    <section className="ml-card p-4">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">지난달 대비 많이 늘어난 카테고리</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">지난달보다 늘어난 카테고리가 없어요.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={item.categoryId} className="flex items-center gap-3">
              <span className="w-4 text-xs font-semibold text-gray-400">{i + 1}</span>
              <CategoryBadge icon={item.category.icon} color={item.category.color} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm text-gray-900">{item.category.name}</span>
              <MoneyAmount value={item.delta} showPlusSign className="text-sm font-medium text-red-600" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
