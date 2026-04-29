import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Football Data App",
  description: "Professional football match data analytics dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-100">
          <Sidebar />
          <main className="ml-64 flex-1 min-w-0 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
