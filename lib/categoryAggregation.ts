import type { DashboardCategoryInfo } from "@/types/dashboard";
import type { CategoryAmountItem } from "@/types/category";

// 홈 대시보드(지출 TOP)와 리포트(카테고리별 집계)가 공통으로 쓰는 "미분류" 처리 —
// 카테고리 없는 지출도 이 키/정보로 묶어야 카테고리별 합계가 총지출과 어긋나 보이지 않는다.
export const UNCATEGORIZED_CATEGORY_ID = "uncategorized";
export const UNCATEGORIZED_CATEGORY_INFO: DashboardCategoryInfo = { name: "미분류", icon: "", color: "gray" };

interface ExpenseRow {
  amount: number;
  category_id: string | null;
  category: DashboardCategoryInfo | null;
}

// 호출 전에 지출(expense) 건만 필터링해서 넘겨야 한다 — 수입 여부까지는 이 함수가 판단하지 않음.
export function groupExpensesByCategory(expenseRows: ExpenseRow[]): CategoryAmountItem[] {
  const map = new Map<string, CategoryAmountItem>();
  for (const row of expenseRows) {
    const key = row.category_id ?? UNCATEGORIZED_CATEGORY_ID;
    const info = row.category_id && row.category ? row.category : UNCATEGORIZED_CATEGORY_INFO;
    const existing = map.get(key);
    if (existing) existing.amount += row.amount;
    else map.set(key, { categoryId: key, category: info, amount: row.amount });
  }
  return Array.from(map.values());
}
