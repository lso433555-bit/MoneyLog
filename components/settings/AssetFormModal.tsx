"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AssetManagementItem } from "@/types/assets";
import type { AssetType } from "@/types/database";

interface AssetFormModalProps {
  editing: AssetManagementItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function AmountField({
  id,
  label,
  digits,
  onChange,
}: {
  id: string;
  label: string;
  digits: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const display = digits ? Number(digits).toLocaleString("ko-KR") : "";
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
        <span className="text-gray-400">₩</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={display}
          onChange={onChange}
          className="w-full bg-transparent font-mono text-sm tabular-nums text-gray-900 outline-none dark:text-gray-100"
        />
      </div>
    </div>
  );
}

export function AssetFormModal({ editing, onClose, onSaved }: AssetFormModalProps) {
  const supabase = createClient();

  const [type, setType] = useState<AssetType>(editing?.type ?? "savings");
  const [name, setName] = useState(editing?.name ?? "");
  const [targetDigits, setTargetDigits] = useState(editing ? String(editing.targetAmount) : "");
  const [currentDigits, setCurrentDigits] = useState(editing ? String(editing.currentAmount) : "");
  const [monthlyDigits, setMonthlyDigits] = useState(editing ? String(editing.monthlyAmount) : "");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onlyDigits = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) =>
    setter(e.target.value.replace(/[^0-9]/g, ""));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    const targetAmount = Number(targetDigits) || 0;
    if (targetAmount <= 0) {
      setError("목표금액을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      type,
      target_amount: targetAmount,
      current_amount: Number(currentDigits) || 0,
      monthly_amount: Number(monthlyDigits) || 0,
    };

    if (editing) {
      const { error: updateError } = await supabase.from("assets").update(payload).eq("id", editing.id);
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

      const { error: insertError } = await supabase.from("assets").insert({ ...payload, household_id: householdId });
      setSubmitting(false);
      if (insertError) {
        setError("저장에 실패했어요. 다시 시도해주세요.");
        return;
      }
    }

    onSaved();
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm(`"${editing.name}"을(를) 삭제할까요?`)) return;

    setDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase.from("assets").delete().eq("id", editing.id);

    setDeleting(false);
    if (deleteError) {
      setError("삭제에 실패했어요. 다시 시도해주세요.");
      return;
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
            {editing ? "자산 수정" : "자산 추가"}
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
            {(["savings", "loan"] as const).map((t) => (
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
                {t === "savings" ? "적금" : "대출"}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="asset-name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              이름
            </label>
            <input
              id="asset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "loan" ? "예: 전세자금대출" : "예: 청약저축"}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <AmountField
            id="target-amount"
            label={type === "loan" ? "대출 원금" : "목표금액"}
            digits={targetDigits}
            onChange={onlyDigits(setTargetDigits)}
          />
          <AmountField
            id="current-amount"
            label={type === "loan" ? "현재 남은 잔액" : "현재 적립액"}
            digits={currentDigits}
            onChange={onlyDigits(setCurrentDigits)}
          />
          <AmountField id="monthly-amount" label="월 납입액" digits={monthlyDigits} onChange={onlyDigits(setMonthlyDigits)} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || deleting}
            className="rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting || deleting}
              className="py-1 text-sm font-medium text-red-600 transition-opacity disabled:opacity-50"
            >
              {deleting ? "삭제 중..." : "이 자산 삭제"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
