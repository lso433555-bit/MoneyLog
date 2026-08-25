const krwFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

// 통화 기호 없이 숫자만 (부호 제외, 절댓값). <MoneyAmount />가 기호/부호를 별도 span으로
// 분리해 그릴 때 사용 — 숫자 부분만 필요할 때는 이 함수를, 기호까지 포함한 순수 문자열이
// 필요할 때(alt/title 속성 등)는 아래 formatKRW()를 쓴다.
export function formatKRWValue(amount: number): string {
  return krwFormatter.format(Math.abs(amount));
}

export function formatKRW(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₩${formatKRWValue(amount)}`;
}

export function formatMonthLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// new Date("YYYY-MM-DD")는 UTC 자정으로 해석되어 시간대에 따라 하루 밀릴 수 있어 문자열을 직접 파싱한다.
export function formatShortDateKo(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

// 월별 추이 그래프처럼 좁은 공간에 금액을 표시할 때 쓰는 "만 원" 단위 축약 표기.
export function formatCompactKRWManwon(amount: number): string {
  const man = Math.round(amount / 10000);
  return `${man.toLocaleString("ko-KR")}만`;
}
