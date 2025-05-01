import type { Metadata } from "next";
import { Courier_Prime, Crimson_Text, Press_Start_2P } from "next/font/google";
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

const pressStart2P = Press_Start_2P({
  weight: ["400"],
  variable: "--font-press-start",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArisanKu",
  description: "Aplikasi Arisan Modern dengan Nuansa Retro 70s/80s",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${courierPrime.variable} ${crimsonText.variable} ${pressStart2P.variable} antialiased min-h-screen font-mono`}
      >
        <Providers>
          {process.env.NODE_ENV === "development" && <SessionDebug />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
