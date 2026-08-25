import { MoneyAmount } from "./MoneyAmount";
import type { AssetItem } from "@/types/dashboard";

// current_amount의 의미가 자산 종류마다 다름: 대출=남은 잔액, 적금=현재 적립액.
// 그래서 진행률(진행 방향)도 다르게 계산한다 — 대출은 잔액이 줄어든 비율, 적금은 목표 대비 쌓인 비율.
function computeProgress(asset: AssetItem): number {
  if (asset.targetAmount <= 0) return 0;
  const ratio =
    asset.type === "loan"
      ? (asset.targetAmount - asset.currentAmount) / asset.targetAmount
      : asset.currentAmount / asset.targetAmount;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

export function AssetProgressCard({ assets }: { assets: AssetItem[] }) {
  if (assets.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">자산 현황</h2>
      <div className="space-y-2">
        {assets.map((asset) => {
          const progress = computeProgress(asset);
          return (
            <div key={asset.id} className="ml-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                  <p className="text-xs text-gray-500">{asset.type === "loan" ? "대출" : "적금"}</p>
                </div>
                <p className="font-mono text-sm font-medium tabular-nums text-gray-700">{progress}%</p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    asset.type === "loan" ? "bg-coral-500" : "bg-teal-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between">
                <MoneyAmount value={asset.currentAmount} className="text-xs text-gray-500" />
                <MoneyAmount value={asset.targetAmount} className="text-xs text-gray-500" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
