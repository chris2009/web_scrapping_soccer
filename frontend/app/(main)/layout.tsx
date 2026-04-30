import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="ml-64 flex flex-1 min-w-0 flex-col">
        <main className="flex-1 p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
