"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { TransactionModal } from "./TransactionModal";
import type { TransactionType } from "@/types/database";

interface TransactionModalContextValue {
  openModal: (type?: TransactionType) => void;
}

const TransactionModalContext = createContext<TransactionModalContextValue | null>(null);

export function useTransactionModal(): TransactionModalContextValue {
  const ctx = useContext(TransactionModalContext);
  if (!ctx) {
    throw new Error("useTransactionModal은 TransactionModalProvider 안에서만 사용할 수 있어요.");
  }
  return ctx;
}

export function TransactionModalProvider({
  children,
  householdId,
}: {
  children: ReactNode;
  householdId: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialType, setInitialType] = useState<TransactionType>("expense");

  const openModal = useCallback((type: TransactionType = "expense") => {
    setInitialType(type);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <TransactionModalContext.Provider value={{ openModal }}>
      {children}
      {isOpen && <TransactionModal initialType={initialType} householdId={householdId} onClose={closeModal} />}
    </TransactionModalContext.Provider>
  );
}
