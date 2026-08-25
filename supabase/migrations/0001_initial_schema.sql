-- MoneyLog 초기 스키마: 테이블, RLS, Google OAuth 화이트리스트, 기본 카테고리 시드

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Enum 타입
-- ============================================================

create type transaction_type as enum ('income', 'expense');
create type asset_type as enum ('loan', 'savings');

-- ============================================================
-- 2. 테이블
-- ============================================================

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default '우리집',
  created_at timestamptz not null default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- household_id가 null이면 기본 제공 카테고리, 값이 있으면 해당 household의 커스텀 카테고리
create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table recurring_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type transaction_type not null,
  name text not null,
  amount numeric(12, 0) not null check (amount >= 0),
  day_of_month int not null check (day_of_month between 1 and 31),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type transaction_type not null,
  category_id uuid references categories(id) on delete set null,
  amount numeric(12, 0) not null check (amount >= 0),
  is_fixed boolean not null default false,
  memo text,
  date date not null default current_date,
  payment_method text,
  recurring_template_id uuid references recurring_templates(id) on delete set null,
  created_at timestamptz not null default now()
);

create table budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  month date not null check (month = date_trunc('month', month)::date),
  amount_limit numeric(12, 0) not null check (amount_limit >= 0),
  created_at timestamptz not null default now(),
  unique (household_id, category_id, month)
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  type asset_type not null,
  target_amount numeric(14, 0) not null check (target_amount >= 0),
  current_amount numeric(14, 0) not null default 0 check (current_amount >= 0),
  monthly_amount numeric(12, 0) not null default 0 check (monthly_amount >= 0),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 로그인 화이트리스트. 코드가 아니라 데이터로 관리 — 이메일 추가는 SQL 한 줄로 끝남
create table allowed_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

-- 자주 쓰는 조회 패턴에 대한 인덱스
create index transactions_household_date_idx on transactions (household_id, date desc);
create index recurring_templates_household_idx on recurring_templates (household_id) where is_active;
create index budgets_household_month_idx on budgets (household_id, month);
create index assets_household_idx on assets (household_id);
create index categories_household_idx on categories (household_id);

-- ============================================================
-- 3. 기본 카테고리 13개 시드
-- ============================================================

insert into categories (household_id, name, icon, color, sort_order) values
  (null, '주거', 'Home', 'coral', 1),
  (null, '통신', 'Smartphone', 'purple', 2),
  (null, '보험', 'Shield', 'blue', 3),
  (null, '헌금', 'HandHeart', 'blue', 4),
  (null, '구독료', 'Repeat', 'pink', 5),
  (null, '식비', 'UtensilsCrossed', 'teal', 6),
  (null, '카페', 'Coffee', 'amber', 7),
  (null, '교통', 'Bus', 'green', 8),
  (null, '쇼핑', 'ShoppingBag', 'red', 9),
  (null, '의료', 'Stethoscope', 'red', 10),
  (null, '경조사', 'Gift', 'pink', 11),
  (null, '여가', 'Gamepad2', 'green', 12),
  (null, '기타', 'MoreHorizontal', 'gray', 13);

-- 로그인 화이트리스트: 본인 이메일. 예은님 이메일은 정해지면
--   insert into allowed_emails (email) values ('배우자이메일@example.com');
-- 한 줄만 SQL Editor에서 실행하면 됩니다.
insert into allowed_emails (email) values ('lso433555@gmail.com');

-- ============================================================
-- 4. Google OAuth 화이트리스트 + household 자동 배정
-- ============================================================

-- auth.users에 새 행이 생기기 "전"에 이메일을 검사해서, 화이트리스트에 없으면
-- 예외를 던져 로그인 자체를 실패시킴 (Supabase Auth가 에러로 클라이언트에 반환)
create or replace function public.check_email_whitelist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.allowed_emails where email = new.email) then
    raise exception '허용되지 않은 이메일입니다: %', new.email;
  end if;
  return new;
end;
$$;

create trigger enforce_email_whitelist
before insert on auth.users
for each row execute function public.check_email_whitelist();

-- 화이트리스트를 통과해 auth.users에 생성된 후, 자동으로 household에 배정.
-- household가 하나도 없으면(=첫 로그인) 새로 만들고, 있으면 기존 household에 합류.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  select household_id into v_household_id from public.household_members limit 1;

  if v_household_id is null then
    insert into public.households (name) values ('성완・예은')
    returning id into v_household_id;
  end if;

  insert into public.household_members (household_id, user_id, display_name)
  values (
    v_household_id,
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- assets.updated_at은 "수동 갱신"이지만, 갱신 시각 자체는 자동으로 now()로 찍히게 함
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_assets_updated_at
before update on assets
for each row execute function public.set_updated_at();

-- ============================================================
-- 5. RLS 활성화
-- ============================================================

alter table households enable row level security;
alter table household_members enable row level security;
alter table categories enable row level security;
alter table recurring_templates enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table assets enable row level security;
alter table allowed_emails enable row level security;
-- allowed_emails는 정책을 하나도 안 만듦 → API/클라이언트에서는 완전히 비공개.
-- 트리거 함수는 security definer라 RLS를 우회하므로 정상 동작함.

-- 현재 로그인한 사용자의 household_id를 반환하는 헬퍼.
-- security definer로 만들어야 household_members 자체의 RLS 정책 안에서 재귀 없이 안전하게 쓸 수 있음.
create or replace function public.get_my_household_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from public.household_members where user_id = auth.uid();
$$;

-- households: 조회/수정만 가능 (생성/삭제는 트리거가 전담)
create policy "households_select" on households
  for select using (id = public.get_my_household_id());
create policy "households_update" on households
  for update using (id = public.get_my_household_id());

-- household_members: 같은 household 멤버 조회만 가능 (등록은 트리거가 전담)
create policy "household_members_select" on household_members
  for select using (household_id = public.get_my_household_id());

-- categories: 기본 카테고리(household_id is null) + 자기 household의 커스텀 카테고리만 조회,
-- 커스텀 카테고리는 자기 household 것만 쓰기 가능
create policy "categories_select" on categories
  for select to authenticated
  using (household_id is null or household_id = public.get_my_household_id());
create policy "categories_insert" on categories
  for insert to authenticated
  with check (household_id = public.get_my_household_id());
create policy "categories_update" on categories
  for update to authenticated
  using (household_id = public.get_my_household_id());
create policy "categories_delete" on categories
  for delete to authenticated
  using (household_id = public.get_my_household_id());

-- transactions / recurring_templates / budgets / assets: 자기 household 것만 CRUD
create policy "transactions_select" on transactions
  for select using (household_id = public.get_my_household_id());
create policy "transactions_insert" on transactions
  for insert with check (household_id = public.get_my_household_id());
create policy "transactions_update" on transactions
  for update using (household_id = public.get_my_household_id());
create policy "transactions_delete" on transactions
  for delete using (household_id = public.get_my_household_id());

create policy "recurring_templates_select" on recurring_templates
  for select using (household_id = public.get_my_household_id());
create policy "recurring_templates_insert" on recurring_templates
  for insert with check (household_id = public.get_my_household_id());
create policy "recurring_templates_update" on recurring_templates
  for update using (household_id = public.get_my_household_id());
create policy "recurring_templates_delete" on recurring_templates
  for delete using (household_id = public.get_my_household_id());

create policy "budgets_select" on budgets
  for select using (household_id = public.get_my_household_id());
create policy "budgets_insert" on budgets
  for insert with check (household_id = public.get_my_household_id());
create policy "budgets_update" on budgets
  for update using (household_id = public.get_my_household_id());
create policy "budgets_delete" on budgets
  for delete using (household_id = public.get_my_household_id());

create policy "assets_select" on assets
  for select using (household_id = public.get_my_household_id());
create policy "assets_insert" on assets
  for insert with check (household_id = public.get_my_household_id());
create policy "assets_update" on assets
  for update using (household_id = public.get_my_household_id());
create policy "assets_delete" on assets
  for delete using (household_id = public.get_my_household_id());
