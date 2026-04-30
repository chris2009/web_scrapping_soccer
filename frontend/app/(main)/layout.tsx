import MainContent from "@/components/MainContent";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
