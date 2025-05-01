import type { Metadata } from "next";
import { Courier_Prime, Crimson_Text } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import SessionDebug from "@/components/SessionDebug";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  variable: "--font-courier",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arisan App",
  description: "A zero-email, QR-code-based ROSCA app for savings groups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${courierPrime.variable} ${crimsonText.variable} antialiased min-h-screen font-serif`}
      >
        <Providers>
          {process.env.NODE_ENV === "development" && <SessionDebug />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
