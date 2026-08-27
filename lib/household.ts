import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// 서버 컴포넌트에서 한 번만 조회해 클라이언트로 내려주기 위한 헬퍼.
// 이전엔 각 폼 모달이 저장 시점마다 클라이언트에서 개별적으로 rpc를 호출했다.
export async function getMyHouseholdId(supabase: SupabaseClient<Database>): Promise<string | null> {
  const { data } = await supabase.rpc("get_my_household_id");
  return data ?? null;
}
