import { Home, BarChart2, Repeat, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// PRD 순서: 홈/입력/리포트/고정지출/설정. "입력"은 모달로 열리는 전용 버튼이라 별도로 렌더링한다.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/report", label: "리포트", icon: BarChart2 },
  { href: "/recurring", label: "고정지출", icon: Repeat },
  { href: "/settings", label: "설정", icon: Settings },
];
