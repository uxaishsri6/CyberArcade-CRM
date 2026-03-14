import { Link, useLocation } from "wouter";
import { Bot, LayoutDashboard, Users, Target, Radio, TrendingUp, Settings, LogOut, Zap, Cpu } from "lucide-react";
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
  cyan:   { text: "text-cyan",   glow: "drop-shadow-[0_0_5px_rgba(0,245,255,0.75)]",   bg: "bg-cyan/10",   border: "border-cyan/35" },
  purple: { text: "text-purple", glow: "drop-shadow-[0_0_5px_rgba(128,64,255,0.75)]",  bg: "bg-purple/10", border: "border-purple/35" },
  green:  { text: "text-green",  glow: "drop-shadow-[0_0_5px_rgba(0,235,126,0.75)]",   bg: "bg-green/10",  border: "border-green/35" },
  yellow: { text: "text-yellow", glow: "drop-shadow-[0_0_5px_rgba(255,200,0,0.75)]",   bg: "bg-yellow/10", border: "border-yellow/35" },
};

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-60 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex" style={{
      background: "linear-gradient(180deg, hsl(228 55% 5%) 0%, hsl(228 50% 4%) 100%)",
      borderRight: "1px solid rgba(0,245,255,0.07)",
    }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.45), rgba(128,64,255,0.45), transparent)" }} />

      {/* Robotics corner bracket — top left */}
      <div className="absolute top-0 left-0 w-3 h-3" style={{
        borderTop: "2px solid rgba(0,245,255,0.5)",
        borderLeft: "2px solid rgba(0,245,255,0.5)",
        borderRadius: "1px 0 0 0",
      }} />

      {/* Logo */}
      <div className="p-5 pb-3">
        <Link href="/dashboard" className="group flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,245,255,0.12), rgba(128,64,255,0.12))",
                border: "1px solid rgba(0,245,255,0.25)",
                boxShadow: "0 0 12px rgba(0,245,255,0.18)"
              }}>
              <Bot className="w-4 h-4 text-cyan" style={{ filter: "drop-shadow(0 0 5px rgba(0,245,255,0.75))" }} />
            </div>
            <div>
              <span className="font-display font-black text-sm tracking-[0.18em] block"
                style={{ background: "linear-gradient(90deg, #00f5ff, #8040ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                CYBERARCADE
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-2.5 h-2.5" style={{ color: "#00eb7e", filter: "drop-shadow(0 0 3px rgba(0,235,126,0.7))" }} />
                <span className="font-mono text-[0.625rem] text-muted-foreground uppercase tracking-[0.3em]">Robotics CRM</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 neon-divider" />

      {/* Nav */}
      <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto pb-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.startsWith(item.href);
          const ac = ACCENT_COLORS[item.accent];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-display text-xs tracking-wider transition-all duration-200 group",
                isActive
                  ? `${ac.text} border ${ac.border}`
                  : "text-muted-foreground hover:text-white border border-transparent hover:border-white/6"
              )}
              style={isActive ? {
                background: `linear-gradient(90deg, rgba(0,245,255,0.07), transparent)`,
                boxShadow: "inset 0 0 16px rgba(0,245,255,0.04)",
              } : {}}
            >
              {/* Active left indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-6 rounded-r-full"
                  style={{ background: "hsl(var(--cyber-cyan))", boxShadow: "0 0 6px rgba(0,245,255,0.8)" }} />
              )}
              <item.icon className={cn("flex-shrink-0", isActive && ac.glow)} style={{ width: "1rem", height: "1rem" }} />
              <span className="font-display tracking-[0.12em]">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" style={{ boxShadow: "0 0 5px rgba(0,245,255,0.9)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="mx-2.5 mb-2.5 rounded-lg p-3" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.07)" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3 h-3 text-yellow flex-shrink-0" style={{ filter: "drop-shadow(0 0 3px rgba(255,200,0,0.7))" }} />
          <span className="font-mono text-[0.625rem] text-muted-foreground uppercase tracking-widest">System Status</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "API",       status: "ONLINE", color: "#00eb7e" },
            { label: "Campaigns", status: "ACTIVE", color: "#00f5ff" },
            { label: "Database",  status: "SYNCED", color: "#8040ff" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                <span className="font-mono text-[0.625rem] font-bold" style={{ color: s.color }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="p-2.5 pt-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center font-display font-bold text-xs"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.25), rgba(128,64,255,0.25))",
              border: "1px solid rgba(0,245,255,0.35)",
              color: "#fff",
              boxShadow: "0 0 8px rgba(0,245,255,0.15)"
            }}>
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xs text-white truncate tracking-wide">Admin Unit</p>
            <p className="font-mono text-[0.625rem] text-cyan truncate" style={{ filter: "drop-shadow(0 0 3px rgba(0,245,255,0.4))" }}>System Lead</p>
          </div>
          <Link href="/login" className="text-muted-foreground hover:text-pink transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
