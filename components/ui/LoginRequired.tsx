export function LoginRequired() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-lg font-medium text-gray-700">로그인이 필요합니다</p>
      <p className="text-sm text-gray-400">Google 로그인은 다음 단계에서 연결할 예정이에요.</p>
    </div>
  );
}
