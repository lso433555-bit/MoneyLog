import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  linkHref?: string;
  linkLabel?: string;
  // 목록형 화면(전체내역/고정지출 관리)은 세로 공간이 넉넉해서 py-12, 대시보드 카드류는 py-8.
  size?: "sm" | "lg";
}

export function EmptyState({ icon: Icon, message, linkHref, linkLabel, size = "sm" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 ${
        size === "lg" ? "py-12" : "py-8"
      } text-center dark:border-gray-700`}
    >
      {Icon && <Icon size={20} className="text-gray-300" />}
      <p className="text-sm text-gray-400">{message}</p>
      {linkHref && linkLabel && (
        <Link href={linkHref} className="text-xs font-medium text-gray-600 underline underline-offset-2 dark:text-gray-400">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
