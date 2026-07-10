import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STAR//INDEX",
  description: "个人 GitHub Star 分类索引",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
