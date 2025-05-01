"use client";

import { ReactNode } from "react";
import AuthProvider from "./AuthProvider";
import { ToastProvider } from "./ToastProvider";
import { GroupProvider } from "@/context/GroupContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GroupProvider>
        {children}
        <ToastProvider />
      </GroupProvider>
    </AuthProvider>
  );
}
