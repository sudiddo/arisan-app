"use client";

import { ReactNode } from "react";
import AuthProvider from "./AuthProvider";
import { ToastProvider } from "./ToastProvider";
import { GroupProvider } from "@/context/GroupContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GroupProvider>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </GroupProvider>
    </AuthProvider>
  );
}
