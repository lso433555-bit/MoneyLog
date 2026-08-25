// 서버 실행 환경(Vercel은 UTC)과 무관하게 항상 한국 시간 기준으로 "이번 달"을 계산한다.
function getKstTodayParts(): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { year: Number(map.year), month: Number(map.month) };
}

export interface CurrentMonthRange {
  start: string; // 이번 달 1일, YYYY-MM-DD
  end: string; // 다음 달 1일, YYYY-MM-DD (exclusive)
  year: number;
  month: number;
}

export function getCurrentMonthRange(): CurrentMonthRange {
  const { year, month } = getKstTodayParts();
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${pad(nextMonth)}-01`;
  return { start, end, year, month };
}

// 입력 폼의 날짜 필드 기본값 등, 한국 시간 기준 "오늘"이 YYYY-MM-DD 문자열로 필요할 때 사용.
export function getKstTodayDateString(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

// 고정지출/수입 템플릿의 day_of_month를 해당 연/월에 실제로 존재하는 날짜로 클램프한다
// (예: 31일 템플릿 → 2월엔 28/29일로).
export function clampDayOfMonth(year: number, month: number, dayOfMonth: number): number {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(dayOfMonth, lastDay);
}
