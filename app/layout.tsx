import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/lib/store";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";

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
          <div className="min-h-screen bg-caddy-cream md:flex">
            <Sidebar />
            <div className="relative mx-auto min-h-screen w-full max-w-md bg-white shadow-card md:max-w-none md:flex-1 md:bg-caddy-cream md:shadow-none">
              <div className="app-scroll min-h-screen overflow-y-auto pb-24 md:pb-0">
                <div className="md:mx-auto md:max-w-3xl md:px-10 md:py-8">{children}</div>
              </div>
              <NavBar />
            </div>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
