import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopCaddy — your AI shopping & budget assistant",
  description:
    "ShopCaddy compares prices across retailers, builds priced shopping lists, and helps you track and stick to a budget.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-caddy-cream">{children}</body>
    </html>
  );
}
