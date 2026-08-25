import {
  Home,
  Smartphone,
  Shield,
  HandHeart,
  Repeat,
  UtensilsCrossed,
  Coffee,
  Bus,
  ShoppingBag,
  Stethoscope,
  Gift,
  Gamepad2,
  MoreHorizontal,
  Circle,
  type LucideIcon,
} from "lucide-react";

// categories.icon 컬럼(문자열)과 매핑되는 Lucide 아이콘.
// supabase/migrations/0001_initial_schema.sql의 시드 데이터와 반드시 일치해야 함.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Home,
  Smartphone,
  Shield,
  HandHeart,
  Repeat,
  UtensilsCrossed,
  Coffee,
  Bus,
  ShoppingBag,
  Stethoscope,
  Gift,
  Gamepad2,
  MoreHorizontal,
};

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && CATEGORY_ICONS[iconName]) || Circle;
}
