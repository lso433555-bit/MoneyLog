import { SignOutButton } from "./SignOutButton";

export function AccountSection({ userEmail }: { userEmail: string }) {
  return (
    <section className="ml-card flex items-center justify-between p-4">
      <div>
        <p className="text-xs text-gray-400">로그인 계정</p>
        <p className="text-sm text-gray-700">{userEmail}</p>
      </div>
      <SignOutButton />
    </section>
  );
}
