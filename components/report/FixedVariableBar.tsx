import { MoneyAmount } from "@/components/dashboard/MoneyAmount";

export function FixedVariableBar({ fixedTotal, variableTotal }: { fixedTotal: number; variableTotal: number }) {
  const total = fixedTotal + variableTotal;

  if (total <= 0) {
    return (
      <section className="ml-card p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">고정 · 유동 지출 비율</h2>
        <p className="text-sm text-gray-400">이번 달 지출 내역이 없어요.</p>
      </section>
    );
  }

  const pctFixed = Math.round((fixedTotal / total) * 100);
  const pctVariable = 100 - pctFixed;

  return (
    <section className="ml-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">고정 · 유동 지출 비율</h2>

      <div className="flex h-6 gap-0.5 overflow-hidden rounded-full bg-gray-100">
        {pctFixed > 0 && <div className="h-full bg-gray-900" style={{ width: `${pctFixed}%` }} />}
        {pctVariable > 0 && <div className="h-full bg-coral-500" style={{ width: `${pctVariable}%` }} />}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-700">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-900" />
          고정 {pctFixed}%
        </span>
        <MoneyAmount value={fixedTotal} className="text-gray-500" />
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-700">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral-500" />
          유동 {pctVariable}%
        </span>
        <MoneyAmount value={variableTotal} className="text-gray-500" />
      </div>
    </section>
  );
}
