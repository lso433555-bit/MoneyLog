"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import type { CategoryOption } from "@/lib/categories";

interface BudgetSettingsViewProps {
  monthLabel: string;
  month: string; // YYYY-MM-01, budgets.month과 매칭
  categories: CategoryOption[];
  initialBudgets: Record<string, number>;
}

export function BudgetSettingsView({ monthLabel, month, categories, initialBudgets }: BudgetSettingsViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, initialBudgets[c.id] ? String(initialBudgets[c.id]) : ""]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(categoryId: string, e: ChangeEvent<HTMLInputElement>) {
    setSaved(false);
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setAmounts((prev) => ({ ...prev, [categoryId]: digits }));
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const { data: householdId } = await supabase.rpc("get_my_household_id");
    if (!householdId) {
      setError("household 정보를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    const upsertRows = categories
      .filter((c) => Number(amounts[c.id]) > 0)
      .map((c) => ({
        household_id: householdId,
        category_id: c.id,
        month,
        amount_limit: Number(amounts[c.id]),
      }));

    // 기존엔 예산이 있었는데 입력을 지워서 0/빈 값이 된 카테고리는 budgets 행 자체를 삭제한다.
    const clearedCategoryIds = categories
      .filter((c) => initialBudgets[c.id] && !(Number(amounts[c.id]) > 0))
      .map((c) => c.id);

    const tasks = [];
    if (upsertRows.length > 0) {
      tasks.push(supabase.from("budgets").upsert(upsertRows, { onConflict: "household_id,category_id,month" }));
    }
    if (clearedCategoryIds.length > 0) {
      tasks.push(
        supabase
          .from("budgets")
          .delete()
          .eq("household_id", householdId)
          .eq("month", month)
          .in("category_id", clearedCategoryIds)
      );
    }

    const results = await Promise.all(tasks);
    setSubmitting(false);

    if (results.some((r) => r.error)) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <>
      <section>
        <h2 className="mb-1 text-sm font-semibold text-gray-700">카테고리별 예산</h2>
        <p className="mb-3 text-xs text-gray-400">{monthLabel} 기준. 비워두면 예산을 적용하지 않아요.</p>

        <ul className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
          {categories.map((cat) => (
            <li key={cat.id} className="ml-card flex items-center gap-3 p-4">
              <CategoryBadge icon={cat.icon} color={cat.color} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{cat.name}</span>
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2">
                <span className="text-xs text-gray-400">₩</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amounts[cat.id] ? Number(amounts[cat.id]).toLocaleString("ko-KR") : ""}
                  onChange={(e) => handleChange(cat.id, e)}
                  className="w-24 bg-transparent text-right font-mono text-sm tabular-nums text-gray-900 outline-none"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={submitting}
        className="rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {submitting ? "저장 중..." : saved ? "저장됨" : "저장"}
      </button>
    </>
  );
}
