import { getCategoryColorClasses } from "@/lib/design/categoryColors";
import { getCategoryIcon } from "@/lib/design/icons";

interface CategoryBadgeProps {
  icon: string;
  color: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ icon, color, size = "md" }: CategoryBadgeProps) {
  const Icon = getCategoryIcon(icon);
  const { badgeBg, badgeText } = getCategoryColorClasses(color);
  const dimensionClass = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <span
      className={`flex ${dimensionClass} shrink-0 items-center justify-center rounded-full ${badgeBg} ${badgeText}`}
    >
      <Icon size={iconSize} strokeWidth={2} />
    </span>
  );
}
