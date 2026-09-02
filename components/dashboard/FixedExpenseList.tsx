import Link from "next/link";
import { Inbox } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { MoneyAmount } from "./MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
import type { FixedExpenseItem } from "@/types/dashboard";

export function FixedExpenseList({ items }: { items: FixedExpenseItem[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">고정지출</h2>
        {items.length > 0 && (
          <Link
            href="/recurring"
            className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            관리
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Inbox} message="등록된 고정지출이 없어요." linkHref="/recurring" linkLabel="+ 고정지출 등록하기" />
      ) : (
        <ul className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
          {items.map((item) => (
            <li key={item.id} className="ml-card flex items-center gap-3 p-4">
              <CategoryBadge icon={item.category?.icon ?? ""} color={item.category?.color ?? "gray"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                <p className="truncate text-xs text-gray-500">{item.category?.name ?? "미분류"}</p>
              </div>
              <MoneyAmount value={item.amount} className="text-sm font-medium text-gray-900 dark:text-gray-100" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
