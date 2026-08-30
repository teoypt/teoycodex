import type { Metadata } from "next";
import "@fontsource/anuphan/400.css";
import "@fontsource/anuphan/500.css";
import "@fontsource/anuphan/600.css";
import "@fontsource/anuphan/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Home — Teoycodex",
  description: "หน้าแรกสำหรับผู้ดูแลระบบ Teoycodex",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
