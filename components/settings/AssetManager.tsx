"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Landmark } from "lucide-react";
import { AssetFormModal } from "./AssetFormModal";
import { MoneyAmount } from "@/components/dashboard/MoneyAmount";
import type { AssetManagementItem } from "@/types/assets";

export function AssetManager({ assets }: { assets: AssetManagementItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AssetManagementItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function openCreateForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(asset: AssetManagementItem) {
    setEditing(asset);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <section>
      <h2 className="mb-1 text-sm font-semibold text-gray-700">자산 (대출·적금)</h2>
      <p className="mb-3 text-xs text-gray-400">잔액은 자동으로 갱신되지 않아요. 바뀔 때마다 직접 수정해주세요.</p>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-8 text-center">
          <Landmark size={20} className="text-gray-300" />
          <p className="text-sm text-gray-400">등록된 자산이 없어요.</p>
        </div>
      ) : (
        <ul className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
          {assets.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                onClick={() => openEditForm(asset)}
                className="ml-card flex w-full items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                  <p className="text-xs text-gray-500">{asset.type === "loan" ? "대출" : "적금"}</p>
                </div>
                <div className="text-right">
                  <MoneyAmount value={asset.currentAmount} className="text-sm font-medium text-gray-900" />
                  <p className="text-xs text-gray-400">
                    목표 <MoneyAmount value={asset.targetAmount} className="text-gray-400" />
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={openCreateForm}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Plus size={18} />
        자산 추가
      </button>

      {formOpen && (
        <AssetFormModal
          editing={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
