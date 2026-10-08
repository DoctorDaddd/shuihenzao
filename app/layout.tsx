import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "画笔勇者 · 25次冒险",
  description: "一支画笔，二十五次冒险。属于女勇者的温暖像素世界。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
