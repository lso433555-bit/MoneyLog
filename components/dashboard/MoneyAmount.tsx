import { formatKRWValue } from "@/lib/format";

interface MoneyAmountProps {
  /** 표시할 금액 (원). 음수면 자동으로 "-" 부호가 붙는다. */
  value: number;
  /** 숫자 부분(₩ 기호 제외)에 적용할 크기/굵기/색상 클래스. */
  className?: string;
  /** 값이 양수여도 "+" 부호를 붙인다 (수입처럼 입금을 명시하고 싶을 때). */
  showPlusSign?: boolean;
  /** 값이 양수로 저장되어 있어도 "-" 부호를 강제로 붙인다 (지출 리스트처럼 항상 출금인 항목). */
  forceNegative?: boolean;
  /** 값이 음수일 때 숫자 전체를 경고색(빨강)으로 표시한다 (예산 초과 등 핵심 지표에만 사용). */
  warnOnNegative?: boolean;
}

// "디지털 통장" 컨셉의 금액 표기 공통 컴포넌트.
// ₩ 기호를 숫자보다 작고 옅게 그려서, formatKRW() 문자열을 통째로 한 폰트 크기에 넣었을 때
// 기호가 숫자만큼 커 보이던 문제를 해결한다. 실제 통장/영수증처럼 입금은 "+", 출금은 "-"로
// 부호를 표기할 수 있다.
export function MoneyAmount({
  value,
  className = "",
  showPlusSign = false,
  forceNegative = false,
  warnOnNegative = false,
}: MoneyAmountProps) {
  const isNegative = forceNegative || value < 0;
  const sign = isNegative ? "-" : showPlusSign ? "+" : "";
  // className에 색상 유틸(text-gray-900 등)이 같이 들어오면 Tailwind가 생성한 스타일시트
  // 순서에 따라 어느 쪽이 이길지 예측 불가능해진다 — !important로 항상 이 경고색이 이기게 한다.
  const colorClass = warnOnNegative && isNegative ? "!text-red-600" : "";
  const rootClassName = ["font-mono", "tabular-nums", colorClass, className].filter(Boolean).join(" ");

  return (
    <span className={rootClassName}>
      {sign}
      <span className="mr-0.5 text-[0.55em] font-normal opacity-60">₩</span>
      {formatKRWValue(value)}
    </span>
  );
}
