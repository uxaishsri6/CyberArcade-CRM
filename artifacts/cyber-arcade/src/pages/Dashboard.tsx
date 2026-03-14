import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { 
  useGetDashboardStats, 
  useGetDashboardFunnel, 
  useGetDashboardCampaignPerformance, 
  useGetDashboardLeadSources,
  useGetDashboardRecentActivities,
  useGetCampaigns
} from "@workspace/api-client-react";
import { Activity, ArrowUpRight, ArrowDownRight, Users, Target, Phone, Mail, MessageSquare, GraduationCap, Play, TrendingUp, Radio, Zap, Rocket, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";

const CHART_COLORS = {
  cyan:   "#00f5ff",
  purple: "#b030ff",
  green:  "#00ff88",
  yellow: "#ffcc00",
  pink:   "#ff1a6b",
};

const PIE_COLORS = ["#00f5ff", "#b030ff", "#00ff88", "#ffcc00", "#ff1a6b"];

const ACTIVITY_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  note:          { icon: MessageSquare, color: "#00f5ff",  bg: "rgba(0,245,255,0.1)" },
  call:          { icon: Phone,         color: "#ffcc00",  bg: "rgba(255,204,0,0.1)" },
  email_sent:    { icon: Mail,          color: "#b030ff",  bg: "rgba(176,48,255,0.1)" },
  whatsapp_sent: { icon: MessageSquare, color: "#00ff88",  bg: "rgba(0,255,136,0.1)" },
  status_change: { icon: Target,        color: "#00f5ff",  bg: "rgba(0,245,255,0.1)" },
  enrolled:      { icon: GraduationCap, color: "#ff1a6b",  bg: "rgba(255,26,107,0.1)" },
};

function SectionHeading({ icon: Icon, label, accent = "cyan" }: { icon: any; label: string; accent?: "cyan" | "purple" | "green" | "yellow" }) {
  const colors: Record<string, string> = {
    cyan:   "#00f5ff", purple: "#b030ff", green: "#00ff88", yellow: "#ffcc00"
  };
  const c = colors[accent];
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${c}18`, border: `1px solid ${c}40` }}>
        <Icon className="w-4 h-4" style={{ color: c, filter: `drop-shadow(0 0 5px ${c})` }} />
      </div>
      <h2 className="font-display text-base tracking-[0.2em] uppercase font-bold" style={{ color: c, textShadow: `0 0 15px ${c}66` }}>
        {label}
      </h2>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${c}40, transparent)` }} />
    </div>
  );
}

function StatCard({ title, value, change, isPercent = false, invertTrend = false, accent = "cyan" }: {
  title: string; value: number; change: number; isPercent?: boolean; invertTrend?: boolean; accent?: string;
}) {
  const isPositive = change >= 0;
  const isGood = invertTrend ? !isPositive : isPositive;
  const colors: Record<string, string> = {
    cyan: "#00f5ff", purple: "#b030ff", green: "#00ff88", yellow: "#ffcc00", pink: "#ff1a6b"
  };
  const c = colors[accent] ?? "#00f5ff";

  return (
    <div className="cyber-stat-card p-5 group cursor-default" style={{ transition: "all 0.25s" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{title}</p>
      <div className="flex items-end justify-between">
        <span className="font-display font-black text-3xl text-white" style={{ textShadow: `0 0 20px ${c}66` }}>
          {value}{isPercent ? '%' : ''}
        </span>
        <span className={`flex items-center gap-0.5 font-mono text-xs mb-0.5 px-1.5 py-0.5 rounded`}
          style={{ background: `${isGood ? "#00ff8822" : "#ff1a6b22"}`, color: isGood ? "#00ff88" : "#ff1a6b", border: `1px solid ${isGood ? "#00ff8840" : "#ff1a6b40"}` }}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      {/* bottom accent line */}
      <div className="mt-3 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, ${c}, transparent)`, boxShadow: `0 0 8px ${c}80` }} />
    </div>
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-card border border-white/5 animate-pulse ${className}`} />;
}

export default function Dashboard() {
  const { data: stats,         isLoading: statsLoading }   = useGetDashboardStats();
  const { data: funnelData,    isLoading: funnelLoading }  = useGetDashboardFunnel();
  const { data: performanceData }                          = useGetDashboardCampaignPerformance();
  const { data: leadSources }                              = useGetDashboardLeadSources();
  const { data: activities }                               = useGetDashboardRecentActivities();
  const { data: campaigns }                                = useGetCampaigns({ status: "scheduled" });

  const isLoading = statsLoading || funnelLoading;

  const STAT_ACCENTS = ["cyan", "purple", "green", "yellow", "cyan", "pink"];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto w-full">
          <div className="h-10 w-80 bg-elevated rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} className="h-28" />)}
          </div>
          <SkeletonCard className="h-52" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonCard className="h-80 lg:col-span-2" />
            <SkeletonCard className="h-80" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto w-full">

        {/* ── Header ── */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #00f5ff, #b030ff)", boxShadow: "0 0 10px rgba(0,245,255,0.6)" }} />
              <h1 className="font-display font-black text-2xl md:text-3xl tracking-[0.2em]" style={{
                background: "linear-gradient(90deg, #ffffff 0%, #00f5ff 50%, #b030ff 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>
                MISSION CONTROL
              </h1>
            </div>
            <p className="font-mono text-xs text-muted-foreground ml-4 tracking-wider">
              Lead pipeline active · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/campaigns/new">
            <button className="cyber-button-primary px-5 py-2.5 text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Launch Mission
            </button>
          </Link>
        </header>

        {/* ── KPI Row ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Total Contacts" value={stats.totalContacts} change={stats.totalContactsChange} accent="cyan" />
            <StatCard title="Trial Attendees" value={stats.trialAttendees} change={stats.trialAttendeesChange} accent="purple" />
            <StatCard title="Active Campaigns" value={stats.activeCampaigns} change={stats.activeCampaignsChange} accent="green" />
            <StatCard title="Conversions" value={stats.conversionsThisMonth} change={stats.conversionsChange} accent="yellow" />
            <StatCard title="Conv. Rate" value={stats.overallConversionRate} change={2.4} isPercent accent="cyan" />
            <StatCard title="Pending Follow-ups" value={stats.pendingFollowUps} change={-5} invertTrend accent="pink" />
          </div>
        )}

        {/* ── Funnel + Quick Metrics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Funnel Bars */}
          <div className="cyber-card p-6 lg:col-span-2">
            <SectionHeading icon={TrendingUp} label="Conversion Pipeline" accent="cyan" />
            <div className="space-y-3">
              {(funnelData ?? []).map((stage, i) => {
                const maxCount = funnelData?.[0]?.count ?? 1;
                const pct = Math.round((stage.count / maxCount) * 100);
                const barColor = i === 0 ? "#00f5ff" : i < 3 ? "#b030ff" : i < 5 ? "#00ff88" : "#ffcc00";
                return (
                  <div key={stage.name} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground w-28 shrink-0 text-right">{stage.name}</span>
                    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${barColor}cc, ${barColor}66)`,
                        boxShadow: `0 0 8px ${barColor}60`,
                      }} />
                    </div>
                    <span className="font-display font-bold text-sm w-10 shrink-0" style={{ color: barColor }}>{stage.count}</span>
                    <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Sources Donut */}
          <div className="cyber-card p-6">
            <SectionHeading icon={Target} label="Lead Sources" accent="purple" />
            <div className="h-[180px]">
              {leadSources && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadSources} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="count" nameKey="source">
                      {leadSources.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} style={{ filter: `drop-shadow(0 0 5px ${PIE_COLORS[i % PIE_COLORS.length]}80)` }} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0a0a1e", border: "1px solid rgba(0,245,255,0.2)", fontFamily: "JetBrains Mono", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-1.5 mt-1">
              {(leadSources ?? []).slice(0, 4).map((s, i) => (
                <div key={s.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length], boxShadow: `0 0 5px ${PIE_COLORS[i % PIE_COLORS.length]}` }} />
                    <span className="font-mono text-[11px] text-muted-foreground capitalize">{s.source}</span>
                  </div>
                  <span className="font-display font-bold text-xs text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Campaign Performance Bar Chart ── */}
        <div className="cyber-card p-6">
          <SectionHeading icon={Radio} label="Campaign Performance — Last 6" accent="green" />
          <div className="h-[240px]">
            {performanceData && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                  <XAxis dataKey="name" stroke="#55557a" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#55557a" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <Tooltip
                    cursor={{ fill: "rgba(0,245,255,0.04)" }}
                    contentStyle={{ background: "#0a0a1e", border: "1px solid rgba(0,245,255,0.2)", fontFamily: "JetBrains Mono", fontSize: 11, borderRadius: 8 }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="sent"      fill={CHART_COLORS.cyan}   radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="opened"    fill={CHART_COLORS.purple} radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="clicked"   fill={CHART_COLORS.green}  radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="converted" fill={CHART_COLORS.yellow} radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-1">
              {[["Sent", "#00f5ff"], ["Opened", "#b030ff"], ["Clicked", "#00ff88"], ["Converted", "#ffcc00"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
                  <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity Feed + Upcoming Campaigns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Activity Feed */}
          <div className="cyber-card flex flex-col overflow-hidden" style={{ maxHeight: 400 }}>
            <div className="p-5 border-b shrink-0" style={{ borderColor: "rgba(0,245,255,0.08)" }}>
              <SectionHeading icon={Activity} label="Live Activity Feed" accent="cyan" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {(activities ?? []).map((act) => {
                const cfg = ACTIVITY_ICONS[act.type] ?? ACTIVITY_ICONS.note;
                const Icon = cfg.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3 px-5 py-3 border-b transition-colors cursor-default"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,245,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-snug">
                        <span className="font-bold text-white">{act.contactName ?? "Unknown"}</span>{" "}
                        <span className="text-muted-foreground font-mono text-xs">{act.description}</span>
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                        {act.createdBy ? ` · ${act.createdBy}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!activities || activities.length === 0) && (
                <div className="p-8 text-center font-mono text-xs text-muted-foreground">No activity detected.</div>
              )}
            </div>
          </div>

          {/* Upcoming Campaigns */}
          <div className="cyber-card flex flex-col overflow-hidden" style={{ maxHeight: 400 }}>
            <div className="p-5 border-b shrink-0 flex items-center justify-between" style={{ borderColor: "rgba(0,245,255,0.08)" }}>
              <SectionHeading icon={Radio} label="Campaign Queue" accent="yellow" />
              <Link href="/campaigns/new">
                <button className="cyber-button-accent px-3 py-1.5 text-xs flex items-center gap-1.5 -mt-5">
                  <Zap className="w-3 h-3" /> New
                </button>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(campaigns ?? []).slice(0, 6).map((camp) => (
                <div key={camp.id} className="flex items-center gap-3 px-5 py-3.5 border-b group transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(176,48,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-display font-bold text-sm text-white group-hover:text-cyan transition-colors truncate">{camp.name}</p>
                      <StatusBadge status={camp.status} />
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {camp.segmentName ?? "All Contacts"} · {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleDateString() : "Unscheduled"}
                    </p>
                  </div>
                  <Link href={`/campaigns/${camp.id}`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
                      style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#00f5ff"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(0,245,255,0.5)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.08)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                      <Eye className="w-3.5 h-3.5 text-cyan group-hover:text-black" />
                    </div>
                  </Link>
                </div>
              ))}
              {(!campaigns || campaigns.length === 0) && (
                <div className="p-8 text-center font-mono text-xs text-muted-foreground">No campaigns scheduled.</div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
