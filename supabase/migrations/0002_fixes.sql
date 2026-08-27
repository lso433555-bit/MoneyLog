-- 코드 리뷰에서 발견된 이슈 수정
-- 1) 고정지출 자동생성 레이스 컨디션 방지 (동시 접속 시 중복 생성 가능했던 문제)
-- 2) household_members에 본인 이름을 고칠 수 있는 UPDATE 정책 추가

-- ============================================================
-- 1. 고정지출 자동생성 중복 방지
-- ============================================================
-- 같은 템플릿에서 같은 날짜로는 거래가 두 번 생성될 수 없도록 DB 레벨에서 강제.
-- lib/recurring.ts가 "없으면 insert"가 아니라 upsert + ignoreDuplicates로 바뀌면서
-- 두 기기가 동시에 앱을 열어도 이 제약이 최종 방어선이 된다.
create unique index transactions_recurring_template_date_idx
  on transactions (recurring_template_id, date)
  where recurring_template_id is not null;

-- ============================================================
-- 2. household_members: 본인 이름 수정 허용
-- ============================================================
-- user_id/household_id는 절대 바뀌면 안 되므로 트리거로 잠그고,
-- display_name만 실질적으로 수정 가능하게 한다.
create or replace function public.prevent_household_members_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.user_id <> old.user_id or new.household_id <> old.household_id then
    raise exception '수정할 수 없는 필드입니다.';
  end if;
  return new;
end;
$$;

create trigger household_members_lock_identity
before update on household_members
for each row execute function public.prevent_household_members_identity_change();

create policy "household_members_update" on household_members
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
