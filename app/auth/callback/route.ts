import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google OAuth 완료 후 Supabase가 돌려보내는 콜백. code를 세션으로 교환한다.
// 화이트리스트에 없는 이메일이면 auth.users insert 트리거(check_email_whitelist)가
// 예외를 던져 exchangeCodeForSession이 실패한다 — 그 경우 홈으로 에러 메시지와 함께 리다이렉트.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
