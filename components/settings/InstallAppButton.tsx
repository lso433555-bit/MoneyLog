"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// Android/데스크탑 Chrome·Edge에서만 지원되는 이벤트. iOS Safari는 이 API 자체가 없어서
// 버튼이 안 뜨는 게 정상 — iOS는 공유 시트의 "홈 화면에 추가"로만 설치 가능하다.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!deferredPrompt || installed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <section className="ml-card flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">앱으로 설치</p>
        <p className="text-xs text-gray-500">홈 화면에 추가해서 앱처럼 쓸 수 있어요.</p>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
      >
        <Download size={16} />
        설치
      </button>
    </section>
  );
}
