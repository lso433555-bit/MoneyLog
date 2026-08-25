// 시드 카테고리의 color 컬럼(coral/purple/blue/...) → Tailwind 클래스 매핑.
// Tailwind는 클래스명을 소스에서 문자열 그대로 스캔하므로, 동적 조합(`bg-${color}-100`)이 아니라
// 완성된 문자열 리터럴로 전부 나열해야 한다.
export const CATEGORY_COLORS = {
  coral: { badgeBg: "bg-coral-100", badgeText: "text-coral-600", bar: "bg-coral-400" },
  purple: { badgeBg: "bg-purple-100", badgeText: "text-purple-600", bar: "bg-purple-400" },
  blue: { badgeBg: "bg-blue-100", badgeText: "text-blue-600", bar: "bg-blue-400" },
  pink: { badgeBg: "bg-pink-100", badgeText: "text-pink-600", bar: "bg-pink-400" },
  teal: { badgeBg: "bg-teal-100", badgeText: "text-teal-600", bar: "bg-teal-400" },
  amber: { badgeBg: "bg-amber-100", badgeText: "text-amber-600", bar: "bg-amber-400" },
  green: { badgeBg: "bg-green-100", badgeText: "text-green-600", bar: "bg-green-400" },
  red: { badgeBg: "bg-red-100", badgeText: "text-red-600", bar: "bg-red-400" },
  gray: { badgeBg: "bg-gray-100", badgeText: "text-gray-600", bar: "bg-gray-400" },
} as const;

export type CategoryColorName = keyof typeof CATEGORY_COLORS;

export function getCategoryColorClasses(color: string) {
  return CATEGORY_COLORS[color as CategoryColorName] ?? CATEGORY_COLORS.gray;
}
