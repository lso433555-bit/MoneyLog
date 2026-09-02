import { createClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/household";
import { LoginRequired } from "@/components/ui/LoginRequired";
import { AssetManager } from "@/components/settings/AssetManager";
import { InstallAppButton } from "@/components/settings/InstallAppButton";
import { ExportDataButton } from "@/components/settings/ExportDataButton";
import { AccountSection } from "@/components/settings/AccountSection";
import type { AssetManagementItem } from "@/types/assets";

interface AssetRow {
  id: string;
  name: string;
  type: "loan" | "savings";
  target_amount: number;
  current_amount: number;
  monthly_amount: number;
}

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginRequired />;
  }

  const [assetsRes, householdId, memberRes] = await Promise.all([
    supabase
      .from("assets")
      .select("id, name, type, target_amount, current_amount, monthly_amount")
      .order("created_at")
      .returns<AssetRow[]>(),
    getMyHouseholdId(supabase),
    supabase.from("household_members").select("display_name").eq("user_id", user.id).single(),
  ]);

  const assets: AssetManagementItem[] = (assetsRes.data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    targetAmount: a.target_amount,
    currentAmount: a.current_amount,
    monthlyAmount: a.monthly_amount,
  }));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:max-w-3xl xl:max-w-5xl">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">설정</h1>

      <AssetManager assets={assets} householdId={householdId} />

      <InstallAppButton />
      <ExportDataButton />

      <AccountSection
        userEmail={user.email ?? ""}
        userId={user.id}
        displayName={memberRes.data?.display_name ?? user.email ?? ""}
      />
    </div>
  );
}
