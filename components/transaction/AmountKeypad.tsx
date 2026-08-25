"use client";

import { Delete } from "lucide-react";

interface AmountKeypadProps {
  digits: string;
  onDigitsChange: (digits: string) => void;
}

// 계산기 스타일 숫자 키패드로 금액을 입력한다. 터치로는 버튼을 누르고, 데스크탑에서는
// 디스플레이 영역에 포커스를 둔 채 물리 키보드 숫자/Backspace로도 그대로 입력할 수 있다.
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"] as const;

// 최대 12자리(약 9999억 원)까지만 허용 — 실수로 자릿수가 폭주하는 걸 막는 정도의 안전장치.
const MAX_DIGITS = 12;

export function AmountKeypad({ digits, onDigitsChange }: AmountKeypadProps) {
  const display = digits ? Number(digits).toLocaleString("ko-KR") : "0";

  function press(key: (typeof KEYS)[number]) {
    if (key === "back") {
      onDigitsChange(digits.slice(0, -1));
      return;
    }
    const next = (digits + key).replace(/^0+(?=\d)/, "");
    if (next.length > MAX_DIGITS) return;
    onDigitsChange(next);
  }

  return (
    <div>
      <div
        tabIndex={0}
        role="textbox"
        aria-label="금액"
        onKeyDown={(e) => {
          if (/^[0-9]$/.test(e.key)) press(e.key as (typeof KEYS)[number]);
          else if (e.key === "Backspace") press("back");
        }}
        className="flex cursor-text items-baseline justify-center gap-1 rounded-xl py-4 outline-none focus:ring-2 focus:ring-coral-500"
      >
        <span className="text-xl font-normal text-gray-400">₩</span>
        <span className="font-mono text-4xl font-semibold tabular-nums text-gray-900">{display}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            aria-label={key === "back" ? "지우기" : key}
            className="flex h-12 items-center justify-center rounded-xl bg-gray-50 text-lg font-medium text-gray-800 transition-colors hover:bg-gray-100"
          >
            {key === "back" ? <Delete size={18} /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
