"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import type { CategoryOption } from "@/lib/categories";
import type { RecurringTemplateItem } from "@/types/recurring";
import type { TransactionType } from "@/types/database";

interface RecurringFormModalProps {
  categories: CategoryOption[];
  editing: RecurringTemplateItem | null;
  defaultType: TransactionType;
  onClose: () => void;
  onSaved: () => void;
}

export function RecurringFormModal({ categories, editing, defaultType, onClose, onSaved }: RecurringFormModalProps) {
  const supabase = createClient();

  const [type, setType] = useState<TransactionType>(editing?.type ?? defaultType);
  const [name, setName] = useState(editing?.name ?? "");
  const [amountDigits, setAmountDigits] = useState(editing ? String(editing.amount) : "");
  const [categoryId, setCategoryId] = useState<string | null>(editing?.category?.id ?? null);
  const [dayOfMonth, setDayOfMonth] = useState(editing ? String(editing.dayOfMonth) : "1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountValue = amountDigits ? Number(amountDigits) : 0;
  const amountDisplay = amountDigits ? amountValue.toLocaleString("ko-KR") : "";
  const dayValue = Number(dayOfMonth) || 0;

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    setAmountDigits(e.target.value.replace(/[^0-9]/g, ""));
  }

  function handleDayChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setDayOfMonth(digits);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (amountValue <= 0) {
      setError("금액을 입력해주세요.");
      return;
    }
    if (dayValue < 1 || dayValue > 31) {
      setError("날짜는 1~31 사이로 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    if (editing) {
      const { error: updateError } = await supabase
        .from("recurring_templates")
        .update({
          type,
          name: name.trim(),
          amount: amountValue,
          category_id: categoryId,
          day_of_month: dayValue,
        })
        .eq("id", editing.id);

      setSubmitting(false);
      if (updateError) {
        setError("저장에 실패했어요. 다시 시도해주세요.");
        return;
      }
    } else {
      const { data: householdId } = await supabase.rpc("get_my_household_id");
      if (!householdId) {
        setError("household 정보를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from("recurring_templates").insert({
        household_id: householdId,
        type,
        name: name.trim(),
        amount: amountValue,
        category_id: categoryId,
        day_of_month: dayValue,
      });

      setSubmitting(false);
      if (insertError) {
        setError("저장에 실패했어요. 다시 시도해주세요.");
        return;
      }
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="ml-card w-full max-w-md rounded-b-none rounded-t-3xl p-6 sm:rounded-b-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editing ? "고정 항목 수정" : "고정 항목 추가"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-500"
                }`}
              >
                {t === "expense" ? "고정 지출" : "고정 수입"}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 월세"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="recurring-amount" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              금액
            </label>
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
              <span className="text-gray-400">₩</span>
              <input
                id="recurring-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountDisplay}
                onChange={handleAmountChange}
                className="w-full bg-transparent font-mono text-lg tabular-nums text-gray-900 outline-none dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">카테고리</p>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={`rounded-full ring-2 transition-colors ${
                      categoryId === cat.id ? "ring-coral-500" : "ring-transparent"
                    }`}
                  >
                    <CategoryBadge icon={cat.icon} color={cat.color} size="sm" />
                  </span>
                  <span className="text-[11px] text-gray-500">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="day" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              매월 며칠
            </label>
            <div className="flex items-center gap-2">
              <input
                id="day"
                type="text"
                inputMode="numeric"
                value={dayOfMonth}
                onChange={handleDayChange}
                className="w-20 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <span className="text-sm text-gray-500">일 (31일보다 짧은 달은 말일로 자동 조정돼요)</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
