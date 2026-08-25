"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CategoryBadge } from "@/components/dashboard/CategoryBadge";
import { MoneyAmount } from "@/components/dashboard/MoneyAmount";
import { RecurringFormModal } from "./RecurringFormModal";
import type { CategoryOption } from "@/lib/categories";
import type { RecurringTemplateItem } from "@/types/recurring";
import type { TransactionType } from "@/types/database";

interface RecurringViewProps {
  initialTemplates: RecurringTemplateItem[];
  categories: CategoryOption[];
}

export function RecurringView({ initialTemplates, categories }: RecurringViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<TransactionType>("expense");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTemplateItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const items = initialTemplates.filter((t) => t.type === tab);

  function openCreateForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(item: RecurringTemplateItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function toggleActive(item: RecurringTemplateItem) {
    setPendingId(item.id);
    await supabase.from("recurring_templates").update({ is_active: !item.isActive }).eq("id", item.id);
    setPendingId(null);
    router.refresh();
  }

  async function handleDelete(item: RecurringTemplateItem) {
    if (!window.confirm(`"${item.name}"을(를) 삭제할까요?`)) return;
    setPendingId(item.id);
    await supabase.from("recurring_templates").delete().eq("id", item.id);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:max-w-3xl xl:max-w-5xl">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">고정지출</h1>

      <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-500"
            }`}
          >
            {t === "expense" ? "고정 지출" : "고정 수입"}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
          <Inbox size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">등록된 {tab === "expense" ? "고정지출" : "고정수입"}이 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className={`ml-card p-4 ${!item.isActive ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                <CategoryBadge icon={item.category?.icon ?? ""} color={item.category?.color ?? "gray"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    매월 {item.dayOfMonth}일 · {item.category?.name ?? "미분류"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <MoneyAmount value={item.amount} className="text-sm font-medium text-gray-900 dark:text-gray-100" />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    disabled={pendingId === item.id}
                    title={item.isActive ? "비활성화" : "활성화"}
                    className={`h-5 w-9 rounded-full transition-colors ${item.isActive ? "bg-gray-900 dark:bg-gray-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform ${
                        item.isActive ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    aria-label="수정"
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={pendingId === item.id}
                    aria-label="삭제"
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={openCreateForm}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
      >
        <Plus size={18} />
        {tab === "expense" ? "고정지출 추가" : "고정수입 추가"}
      </button>

      {formOpen && (
        <RecurringFormModal
          categories={categories}
          editing={editing}
          defaultType={tab}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
