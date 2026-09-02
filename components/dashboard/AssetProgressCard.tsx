import { Landmark, PiggyBank, Wallet } from "lucide-react";
import { MoneyAmount } from "./MoneyAmount";
import { EmptyState } from "@/components/ui/EmptyState";
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
  // 순자산 = 적금 잔액 합 - 대출 잔액 합 (대출 currentAmount는 "남은 잔액"이라 그대로 부채로 뺀다).
  const netWorth = assets.reduce(
    (sum, a) => sum + (a.type === "savings" ? a.currentAmount : -a.currentAmount),
    0
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">자산 현황</h2>
        {assets.length > 0 && (
          <span className="text-xs text-gray-400">
            순자산{" "}
            <MoneyAmount
              value={netWorth}
              warnOnNegative
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            />
          </span>
        )}
      </div>
      {assets.length === 0 ? (
        <EmptyState icon={Wallet} message="등록된 자산이 없어요." linkHref="/settings" linkLabel="+ 자산 등록하기" />
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => {
            const progress = computeProgress(asset);
            const Icon = asset.type === "loan" ? Landmark : PiggyBank;
            const badgeClass = asset.type === "loan" ? "bg-coral-100 text-coral-600" : "bg-teal-100 text-teal-600";

            return (
              <div key={asset.id} className="ml-card p-4">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${badgeClass}`}>
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.type === "loan" ? "대출" : "적금"}</p>
                  </div>
                  <p className="font-mono text-sm font-medium tabular-nums text-gray-700 dark:text-gray-300">
                    {progress}%
                  </p>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
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
      )}
    </section>
  );
}
