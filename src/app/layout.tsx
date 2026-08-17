import type { Metadata } from "next";
import { Inter, Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["200", "400", "700", "900"],
  variable: "--font-serif",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BKing — 东方玄学 · AI 命理",
  description: "八字 · 紫微斗数 · 奇门遁甲 · 星座 · 塔罗 — 五大玄学系统，AI 交叉验证你的命运",
  openGraph: {
    title: "BKing — 东方玄学 · AI 命理",
    description: "五大玄学系统，AI 交叉验证你的命运",
    url: "https://bking.one",
    siteName: "BKing",
    locale: "zh_CN",
    type: "website",
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${inter.variable} ${notoSerifSC.variable} ${notoSansSC.variable} font-sans bg-dark-900 text-white antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}