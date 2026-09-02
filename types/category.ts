import type { DashboardCategoryInfo } from "@/types/dashboard";

// 홈 대시보드(지출 TOP)와 리포트(카테고리별 집계)가 공통으로 쓰는 "카테고리별 합계" 모양.
export interface CategoryAmountItem {
  categoryId: string;
  category: DashboardCategoryInfo;
  amount: number;
}
