import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavProps {
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  isNextDisabled: boolean;
}

export function MonthNav({ monthLabel, prevHref, nextHref, isNextDisabled }: MonthNavProps) {
  return (
    <div className="ml-card flex items-center justify-between p-4">
      <Link href={prevHref} aria-label="이전 달" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
        <ChevronLeft size={20} />
      </Link>
      <span className="text-base font-semibold text-gray-900">{monthLabel}</span>
      {isNextDisabled ? (
        <span aria-hidden className="rounded-full p-2 text-gray-200">
          <ChevronRight size={20} />
        </span>
      ) : (
        <Link href={nextHref} aria-label="다음 달" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <ChevronRight size={20} />
        </Link>
      )}
    </div>
  );
}
