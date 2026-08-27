"use client";

import { useMemo, useState } from "react";
import { Search, Inbox, Repeat } from "lucide-react";
import { MonthNav } from "@/components/ui/MonthNav";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { MoneyAmount } from "@/components/dashboard/MoneyAmount";
import { formatShortDateKo } from "@/lib/format";
import { TransactionModal, type EditingTransaction } from "@/components/transaction/TransactionModal";
import type { TransactionListItem } from "@/types/transactions";
import type { TransactionType } from "@/types/database";

interface TransactionsViewProps {
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  isNextDisabled: boolean;
  transactions: TransactionListItem[];
  householdId: string | null;
}

type TypeFilter = "all" | TransactionType;

export function TransactionsView({
  monthLabel,
  prevHref,
  nextHref,
  isNextDisabled,
  transactions,
  householdId,
}: TransactionsViewProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<TransactionListItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (!q) return true;
      const haystack = `${t.memo ?? ""} ${t.category?.name ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [transactions, typeFilter, query]);

  function toEditingTransaction(t: TransactionListItem): EditingTransaction {
    return {
      id: t.id,
      type: t.type,
      amount: t.amount,
      categoryId: t.categoryId,
      date: t.date,
      memo: t.memo,
      paymentMethod: t.paymentMethod,
      isFixed: t.isFixed,
    };
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:max-w-3xl xl:max-w-5xl">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">전체 내역</h1>

      <MonthNav monthLabel={monthLabel} prevHref={prevHref} nextHref={nextHref} isNextDisabled={isNextDisabled} />

      <div className="grid w-full grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {(
          [
            { value: "all", label: "전체" },
            { value: "expense", label: "지출" },
            { value: "income", label: "수입" },
          ] as const
        ).map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTypeFilter(t.value)}
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              typeFilter === t.value
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 dark:border-gray-700">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="메모, 카테고리로 검색"
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
          <Inbox size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">
            {transactions.length === 0 ? "이번 달 내역이 없어요." : "검색 결과가 없어요."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0 xl:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setEditing(t)}
                className="ml-card flex w-full flex-col gap-2 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <CategoryBadge icon={t.category?.icon ?? ""} color={t.category?.color ?? "gray"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t.memo || t.category?.name || (t.type === "income" ? "수입" : "지출")}
                      {t.isFixed && <Repeat size={12} className="shrink-0 text-gray-400" aria-label="고정" />}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {formatShortDateKo(t.date)} · {t.category?.name ?? "미분류"}
                      {t.paymentMethod && ` · ${t.paymentMethod}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.enteredBy && <span className="text-[10px] text-gray-400">{t.enteredBy}</span>}
                  <MoneyAmount
                    value={t.amount}
                    className={`ml-auto whitespace-nowrap text-sm font-medium ${
                      t.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <TransactionModal
          initialType={editing.type}
          editing={toEditingTransaction(editing)}
          householdId={householdId}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
