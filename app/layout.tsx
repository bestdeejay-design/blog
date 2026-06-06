import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "News Admin System",
  description: "Simple news management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
