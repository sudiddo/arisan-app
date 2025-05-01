"use client";

import { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <Theme accentColor="amber" grayColor="slate" radius="medium" scaling="95%">
      {children}
    </Theme>
  );
}
