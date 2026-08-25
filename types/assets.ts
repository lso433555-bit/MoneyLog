import type { AssetType } from "@/types/database";

export interface AssetManagementItem {
  id: string;
  name: string;
  type: AssetType;
  targetAmount: number;
  currentAmount: number;
  monthlyAmount: number;
}
