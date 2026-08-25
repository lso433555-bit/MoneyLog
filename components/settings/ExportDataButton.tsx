"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ExportRow {
  date: string;
  type: "income" | "expense";
  amount: number;
  is_fixed: boolean;
  memo: string | null;
  payment_method: string | null;
  category: { name: string } | null;
}

function toCsvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map(toCsvField).join(",")).join("\n");
  // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인다.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportDataButton() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("transactions")
      .select("date, type, amount, is_fixed, memo, payment_method, category:categories(name)")
      .order("date", { ascending: false })
      .returns<ExportRow[]>();

    setLoading(false);

    if (fetchError || !data) {
      setError("내보내기에 실패했어요. 다시 시도해주세요.");
      return;
    }

    const rows: string[][] = [
      ["날짜", "종류", "카테고리", "금액", "고정/유동", "메모", "결제수단"],
      ...data.map((t) => [
        t.date,
        t.type === "income" ? "수입" : "지출",
        t.category?.name ?? "미분류",
        String(t.amount),
        t.is_fixed ? "고정" : "유동",
        t.memo ?? "",
        t.payment_method ?? "",
      ]),
    ];

    downloadCsv(`moneylog_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  return (
    <section className="ml-card flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">데이터 내보내기</p>
        <p className="text-xs text-gray-500">전체 거래 내역을 CSV 파일로 저장해요.</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          <Download size={16} />
          {loading ? "내보내는 중..." : "CSV"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </section>
  );
}
