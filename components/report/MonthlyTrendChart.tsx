import { formatCompactKRWManwon } from "@/lib/format";
import type { MonthlyTrendPoint } from "@/types/report";

export function MonthlyTrendChart({ points }: { points: MonthlyTrendPoint[] }) {
  const max = Math.max(...points.map((p) => p.total), 1);
  const hasData = points.some((p) => p.total > 0);

  return (
    <section className="ml-card p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">월별 지출 추이</h2>
      {!hasData ? (
        <p className="text-sm text-gray-400">표시할 데이터가 없어요.</p>
      ) : (
        <div className="flex items-end justify-between gap-2">
          {points.map((p, i) => {
            const heightPct = p.total > 0 ? Math.max(4, Math.round((p.total / max) * 100)) : 0;
            const isViewed = i === points.length - 1;
            return (
              <div key={`${p.year}-${p.month}`} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium tabular-nums text-gray-500">
                  {p.total > 0 ? formatCompactKRWManwon(p.total) : ""}
                </span>
                <div className="flex h-24 w-full items-end justify-center border-b border-gray-200 dark:border-gray-800">
                  <div
                    className={`w-6 rounded-t-md transition-[height] duration-300 ${
                      isViewed ? "bg-coral-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{p.month}월</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
