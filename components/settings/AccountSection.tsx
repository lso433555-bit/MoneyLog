"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "./SignOutButton";

interface AccountSectionProps {
  userEmail: string;
  userId: string;
  displayName: string;
}

export function AccountSection({ userEmail, userId, displayName }: AccountSectionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("household_members")
      .update({ display_name: trimmed })
      .eq("user_id", userId);

    setSubmitting(false);
    if (updateError) {
      setError("이름 변경에 실패했어요. 다시 시도해주세요.");
      return;
    }

    setName(trimmed);
    setEditing(false);
    router.refresh();
  }

  return (
    <section className="ml-card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">로그인 계정</p>
          <p className="truncate text-sm text-gray-700 dark:text-gray-300">{userEmail}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400">표시 이름</p>
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={handleChange}
              autoFocus
              className="mt-0.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          ) : (
            <p className="truncate text-sm text-gray-700 dark:text-gray-300">{name}</p>
          )}
        </div>
        {editing ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            aria-label="저장"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <Check size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="이름 수정"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
