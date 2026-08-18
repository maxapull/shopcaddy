import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopCaddy — your AI budget assistant",
  description:
    "ShopCaddy logs what you spend, builds shopping lists, and helps you track and stick to a budget — in conversation or in a form.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-caddy-cream">{children}</body>
    </html>
  );
}
