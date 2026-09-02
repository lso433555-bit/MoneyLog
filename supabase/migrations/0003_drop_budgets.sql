-- 카테고리별 예산 기능을 "이번 달 지출 TOP" 랭킹으로 대체하면서(2026-09-02) budgets 테이블이
-- 앱 코드 어디서도 쓰이지 않게 됨 — 죽은 스키마로 남겨두지 않고 정리한다.
-- cascade가 인덱스(budgets_household_month_idx)와 RLS 정책(budgets_select/insert/update/delete)도 함께 제거한다.
drop table if exists budgets cascade;
