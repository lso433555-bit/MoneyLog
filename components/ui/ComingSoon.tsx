export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-1 px-4 text-center">
      <p className="text-lg font-medium text-gray-700">{title}</p>
      <p className="text-sm text-gray-400">다음 STEP에서 만들 예정이에요.</p>
    </div>
  );
}
