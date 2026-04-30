"use client";

import Footer from "@/components/Footer";
import { useSidebar } from "@/context/SidebarContext";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div
      className="flex flex-1 min-w-0 flex-col transition-all duration-300"
      style={{ marginLeft: collapsed ? "4rem" : "16rem" }}
    >
      <main className="flex-1 p-8">{children}</main>
      <Footer />
    </div>
  );
}
