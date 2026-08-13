import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/lib/store";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "ShopCaddy — smart shopping, sorted",
  description:
    "ShopCaddy builds priced shopping lists with AI, finds cheaper alternatives, and can buy things for you in chat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppStateProvider>
          <div className="relative mx-auto min-h-screen w-full max-w-md bg-white shadow-card">
            <div className="app-scroll min-h-screen overflow-y-auto pb-24">{children}</div>
            <NavBar />
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
