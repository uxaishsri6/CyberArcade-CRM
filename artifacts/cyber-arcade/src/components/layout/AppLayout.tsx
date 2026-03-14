import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 text-cyan">
          <span className="font-display font-bold text-xl tracking-widest">CYBERARCADE</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col relative z-10">
        {children}
      </main>
    </div>
  );
}
