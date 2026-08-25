// 임시 프리뷰 페이지 — 로그인 연동 전 대시보드 레이아웃 확인용. 확인 후 삭제할 것.
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { DashboardData } from "@/types/dashboard";

const SAMPLE_DATA: DashboardData = {
  monthLabel: "2026년 8월",
  householdLabel: "성완 · 예은",
  remainingBudget: 1284300,
  income: 5200000,
  expense: 3915700,
  fixedExpenses: [
    { id: "1", name: "월세", amount: 900000, category: { name: "주거", icon: "Home", color: "coral" } },
    { id: "2", name: "가족 요금제", amount: 89000, category: { name: "통신", icon: "Smartphone", color: "purple" } },
  ],
  recentTransactions: [
    {
      id: "1",
      memo: "이마트 장보기",
      amount: 68400,
      date: "2026-08-22",
      category: { name: "식비", icon: "UtensilsCrossed", color: "teal" },
    },
    {
      id: "2",
      memo: "스타벅스",
      amount: 12600,
      date: "2026-08-21",
      category: { name: "카페", icon: "Coffee", color: "amber" },
    },
  ],
  assets: [
    { id: "1", name: "전세자금대출", type: "loan", targetAmount: 100000000, currentAmount: 62000000 },
    { id: "2", name: "적금", type: "savings", targetAmount: 20000000, currentAmount: 8500000 },
  ],
  categoryBudgets: [
    {
      categoryId: "1",
      category: { name: "식비", icon: "UtensilsCrossed", color: "teal" },
      spent: 420000,
      limit: 500000,
    },
    {
      categoryId: "2",
      category: { name: "카페", icon: "Coffee", color: "amber" },
      spent: 95000,
      limit: 80000,
    },
  ],
};

export default function DevPreviewPage() {
  return <DashboardView data={SAMPLE_DATA} />;
}
