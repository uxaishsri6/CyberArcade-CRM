import { Link, useLocation } from "wouter";
import { Bot, LayoutDashboard, Users, Target, Radio, TrendingUp, Settings, LogOut } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/segments", label: "Segments", icon: Target },
    { href: "/campaigns", label: "Campaigns", icon: Radio },
    { href: "/conversions", label: "Conversions", icon: TrendingUp },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex">
      <div className="p-6">
        <Link href="/dashboard" className="flex flex-col items-start gap-1 group">
          <div className="flex items-center gap-2 text-cyan">
            <Bot className="w-8 h-8 drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] group-hover:animate-pulse" />
            <span className="font-display font-bold text-xl tracking-widest text-shadow-glow">CYBERARCADE</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] ml-10">Mission Control</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-200 group relative",
                isActive 
                  ? "text-cyan bg-cyan/5 border-l-2 border-cyan shadow-[inset_4px_0_10px_rgba(0,245,255,0.1)]" 
                  : "text-muted-foreground hover:text-white hover:bg-elevated"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_5px_rgba(0,245,255,0.5)]")} />
              {item.label}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan blur-[2px] rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-elevated/50 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-purple p-[1px]">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center font-display font-bold text-xs">
              AD
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold truncate text-white">Admin Unit</p>
            <p className="text-[10px] font-mono text-cyan truncate">System Lead</p>
          </div>
          <Link href="/login" className="text-muted-foreground hover:text-pink transition-colors">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
