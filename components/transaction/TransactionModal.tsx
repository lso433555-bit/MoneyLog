"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getKstTodayDateString } from "@/lib/date";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { AmountKeypad } from "@/components/transaction/AmountKeypad";
import type { CategoryOption } from "@/lib/categories";
import type { TransactionType } from "@/types/database";

interface TransactionModalProps {
  initialType: TransactionType;
  onClose: () => void;
}

const RECENT_LOOKBACK = 40;

export function TransactionModal({ initialType, onClose }: TransactionModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountDigits, setAmountDigits] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(getKstTodayDateString());
  const [memo, setMemo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isFixed, setIsFixed] = useState(false);

  const [categories, setCategories] = useState<CategoryOption[] | null>(null);
  // 타입(수입/지출)별로 최근 사용한 카테고리 id를 최신순으로 저장 — 카테고리 그리드 상단 노출용.
  const [recentCategoryIds, setRecentCategoryIds] = useState<Record<TransactionType, string[]>>({
    expense: [],
    income: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("categories")
      .select("id, name, icon, color")
      .order("sort_order")
      .then(({ data }) => {
        if (!cancelled) setCategories(data ?? []);
      });

    supabase
      .from("transactions")
      .select("type, category_id")
      .not("category_id", "is", null)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(RECENT_LOOKBACK)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const byType: Record<TransactionType, string[]> = { expense: [], income: [] };
        for (const row of data) {
          if (!row.category_id) continue;
          const seen = byType[row.type];
          if (!seen.includes(row.category_id)) seen.push(row.category_id);
        }
        setRecentCategoryIds(byType);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 현재 선택된 타입(수입/지출) 기준으로 최근 사용한 카테고리를 앞쪽에 배치.
  const orderedCategories = useMemo(() => {
    if (!categories) return null;
    const recentIds = recentCategoryIds[type];
    const byId = new Map(categories.map((c) => [c.id, c]));
    const recent = recentIds.map((id) => byId.get(id)).filter((c): c is CategoryOption => Boolean(c));
    const rest = categories.filter((c) => !recentIds.includes(c.id));
    return [...recent, ...rest];
  }, [categories, recentCategoryIds, type]);

  const amountValue = amountDigits ? Number(amountDigits) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (amountValue <= 0) {
      setError("금액을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: householdId } = await supabase.rpc("get_my_household_id");

    if (!user || !householdId) {
      setError("household 정보를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("transactions").insert({
      household_id: householdId,
      user_id: user.id,
      type,
      category_id: categoryId,
      amount: amountValue,
      is_fixed: isFixed,
      memo: memo.trim() || null,
      payment_method: paymentMethod.trim() || null,
      date,
    });

    setSubmitting(false);

    if (insertError) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="ml-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-b-none rounded-t-3xl p-6 sm:rounded-b-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {type === "expense" ? "지출 추가" : "수입 추가"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  type === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                {t === "expense" ? "지출" : "수입"}
              </button>
            ))}
          </div>

          <AmountKeypad digits={amountDigits} onDigitsChange={setAmountDigits} />

          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">카테고리</p>
            {orderedCategories === null ? (
              <p className="py-2 text-sm text-gray-400">불러오는 중...</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {orderedCategories.map((cat) => (
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
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">고정 {type === "expense" ? "지출" : "수입"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={isFixed}
              onClick={() => setIsFixed((v) => !v)}
              className={`h-6 w-11 shrink-0 rounded-full transition-colors ${isFixed ? "bg-gray-900" : "bg-gray-200"}`}
            >
              <span
                className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform ${
                  isFixed ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-gray-700">
                날짜
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none"
              />
            </div>
            <div>
              <label htmlFor="payment-method" className="mb-1.5 block text-sm font-medium text-gray-700">
                결제수단 (선택)
              </label>
              <input
                id="payment-method"
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="예: 카드"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="memo" className="mb-1.5 block text-sm font-medium text-gray-700">
              메모 (선택)
            </label>
            <input
              id="memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 이마트 장보기"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
