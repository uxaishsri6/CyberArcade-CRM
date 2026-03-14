import { Link, useLocation } from "wouter";
import { Bot, LayoutDashboard, Users, Target, Radio, TrendingUp, Settings, LogOut, Zap } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard, accent: "cyan" },
  { href: "/contacts",    label: "Contacts",    icon: Users,            accent: "purple" },
  { href: "/segments",    label: "Segments",    icon: Target,           accent: "green" },
  { href: "/campaigns",   label: "Campaigns",   icon: Radio,            accent: "cyan" },
  { href: "/conversions", label: "Conversions", icon: TrendingUp,       accent: "yellow" },
  { href: "/settings",    label: "Settings",    icon: Settings,         accent: "purple" },
];

const ACCENT_COLORS: Record<string, { text: string; glow: string; bg: string; border: string }> = {
  cyan:   { text: "text-cyan",   glow: "drop-shadow-[0_0_6px_rgba(0,245,255,0.8)]",  bg: "bg-cyan/10",   border: "border-cyan/40" },
  purple: { text: "text-purple", glow: "drop-shadow-[0_0_6px_rgba(176,48,255,0.8)]", bg: "bg-purple/10", border: "border-purple/40" },
  green:  { text: "text-green",  glow: "drop-shadow-[0_0_6px_rgba(0,255,136,0.8)]",  bg: "bg-green/10",  border: "border-green/40" },
  yellow: { text: "text-yellow", glow: "drop-shadow-[0_0_6px_rgba(255,204,0,0.8)]",  bg: "bg-yellow/10", border: "border-yellow/40" },
};

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex" style={{
      background: "linear-gradient(180deg, hsl(240 60% 5%) 0%, hsl(240 55% 4%) 100%)",
      borderRight: "1px solid rgba(0,245,255,0.08)",
    }}>
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(176,48,255,0.5), transparent)" }} />

      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="group flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(176,48,255,0.15))", border: "1px solid rgba(0,245,255,0.3)", boxShadow: "0 0 16px rgba(0,245,255,0.25)" }}>
              <Bot className="w-5 h-5 text-cyan group-hover:animate-pulse" style={{ filter: "drop-shadow(0 0 6px rgba(0,245,255,0.8))" }} />
            </div>
            <span className="font-display font-black text-[17px] tracking-[0.2em]"
              style={{ background: "linear-gradient(90deg, #00f5ff, #b030ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              CYBERARCADE
            </span>
          </div>
          <div className="flex items-center gap-2 ml-12">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" style={{ boxShadow: "0 0 5px rgba(0,245,255,0.8)" }} />
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.35em]">Mission Control</span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-4 neon-divider" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location.startsWith(item.href);
          const ac = ACCENT_COLORS[item.accent];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-display text-[13px] tracking-wider transition-all duration-200 group",
                isActive
                  ? `${ac.text} border ${ac.border}`
                  : "text-muted-foreground hover:text-white border border-transparent hover:border-white/8"
              )}
              style={isActive ? {
                background: `linear-gradient(90deg, rgba(0,245,255,0.08), transparent)`,
                boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)",
              } : {}}
            >
              {/* Active left bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                  style={{ background: "hsl(var(--cyber-cyan))", boxShadow: "0 0 8px rgba(0,245,255,0.8)" }} />
              )}
              <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive && ac.glow)} style={{ width: "1.1rem", height: "1.1rem" }} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" style={{ boxShadow: "0 0 6px rgba(0,245,255,0.9)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="mx-3 mb-3 rounded-xl p-3" style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-yellow" style={{ filter: "drop-shadow(0 0 4px rgba(255,204,0,0.8))" }} />
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">System Status</span>
        </div>
        <div className="space-y-1">
          {[
            { label: "API", status: "ONLINE", color: "#00ff88" },
            { label: "Campaigns", status: "ACTIVE", color: "#00f5ff" },
            { label: "DB", status: "SYNCED", color: "#b030ff" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                <span className="font-mono text-[9px]" style={{ color: s.color }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="p-3 pt-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold text-xs"
            style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.3), rgba(176,48,255,0.3))", border: "1px solid rgba(0,245,255,0.4)", color: "#fff", boxShadow: "0 0 10px rgba(0,245,255,0.2)" }}>
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm text-white truncate">Admin Unit</p>
            <p className="font-mono text-[10px] text-cyan truncate" style={{ filter: "drop-shadow(0 0 4px rgba(0,245,255,0.5))" }}>System Lead</p>
          </div>
          <Link href="/login" className="text-muted-foreground hover:text-pink transition-colors opacity-0 group-hover:opacity-100">
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
