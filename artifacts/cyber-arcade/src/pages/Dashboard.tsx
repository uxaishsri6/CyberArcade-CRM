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
import { Activity, ArrowUpRight, ArrowDownRight, Users, Target, Phone, Mail, MessageSquare, GraduationCap, TrendingUp, Radio, Zap, Rocket, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";

const CHART_COLORS = {
  cyan:   "#00f5ff",
  purple: "#8040ff",
  green:  "#00eb7e",
  yellow: "#ffc800",
  pink:   "#ff1a6b",
};

const PIE_COLORS = ["#00f5ff", "#8040ff", "#00eb7e", "#ffc800", "#ff1a6b"];

const ACTIVITY_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  note:          { icon: MessageSquare, color: "#00f5ff",  bg: "rgba(0,245,255,0.08)" },
  call:          { icon: Phone,         color: "#ffc800",  bg: "rgba(255,200,0,0.08)" },
  email_sent:    { icon: Mail,          color: "#8040ff",  bg: "rgba(128,64,255,0.08)" },
  whatsapp_sent: { icon: MessageSquare, color: "#00eb7e",  bg: "rgba(0,235,126,0.08)" },
  status_change: { icon: Target,        color: "#00f5ff",  bg: "rgba(0,245,255,0.08)" },
  enrolled:      { icon: GraduationCap, color: "#ff1a6b",  bg: "rgba(255,26,107,0.08)" },
};

function SectionHeading({ icon: Icon, label, accent = "cyan" }: { icon: any; label: string; accent?: "cyan" | "purple" | "green" | "yellow" }) {
  const colors: Record<string, string> = {
    cyan: "#00f5ff", purple: "#8040ff", green: "#00eb7e", yellow: "#ffc800"
  };
  const c = colors[accent];
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: `${c}12`, border: `1px solid ${c}35` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: c, filter: `drop-shadow(0 0 4px ${c}bb)` }} />
      </div>
      <h2 className="font-display text-xs tracking-[0.22em] uppercase font-bold" style={{ color: c, textShadow: `0 0 12px ${c}55` }}>
        {label}
      </h2>
      {/* Robotics trace line */}
      <div className="flex-1 flex items-center gap-1">
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${c}35, transparent)` }} />
        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: c, opacity: 0.4 }} />
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPercent = false, invertTrend = false, accent = "cyan" }: {
  title: string; value: number; change: number; isPercent?: boolean; invertTrend?: boolean; accent?: string;
}) {
  const isPositive = change >= 0;
  const isGood = invertTrend ? !isPositive : isPositive;
  const colors: Record<string, string> = {
    cyan: "#00f5ff", purple: "#8040ff", green: "#00eb7e", yellow: "#ffc800", pink: "#ff1a6b"
  };
  const c = colors[accent] ?? "#00f5ff";

  return (
    <div className="cyber-stat-card p-4 group cursor-default" style={{ transition: "all 0.2s" }}>
      {/* Label */}
      <p className="robo-label mb-2.5 leading-tight">{title}</p>
      <div className="flex items-end justify-between gap-1">
        {/* Value */}
        <span className="font-display font-black text-2xl text-white leading-none" style={{ textShadow: `0 0 16px ${c}55` }}>
          {value}{isPercent ? '%' : ''}
        </span>
        {/* Delta badge */}
        <span className="flex items-center gap-0.5 font-mono text-[0.6875rem] mb-0.5 px-1.5 py-0.5 rounded leading-none"
          style={{
            background: `${isGood ? "#00eb7e18" : "#ff1a6b18"}`,
            color: isGood ? "#00eb7e" : "#ff1a6b",
            border: `1px solid ${isGood ? "#00eb7e35" : "#ff1a6b35"}`
          }}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      {/* Bottom accent bar */}
      <div className="mt-3 h-[1.5px] rounded-full" style={{ background: `linear-gradient(90deg, ${c}cc, ${c}22)`, boxShadow: `0 0 6px ${c}60` }} />
    </div>
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-card border border-white/5 animate-pulse ${className}`} />;
}

export default function Dashboard() {
  const { data: stats,         isLoading: statsLoading }   = useGetDashboardStats();
  const { data: funnelData,    isLoading: funnelLoading }  = useGetDashboardFunnel();
  const { data: performanceData }                          = useGetDashboardCampaignPerformance();
  const { data: leadSources }                              = useGetDashboardLeadSources();
  const { data: activities }                               = useGetDashboardRecentActivities();
  const { data: campaigns }                                = useGetCampaigns({ status: "scheduled" });

  const isLoading = statsLoading || funnelLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-5 md:p-7 space-y-5 animate-pulse max-w-7xl mx-auto w-full">
          <div className="h-9 w-72 bg-elevated rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} className="h-24" />)}
          </div>
          <SkeletonCard className="h-44" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SkeletonCard className="h-72 lg:col-span-2" />
            <SkeletonCard className="h-72" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition className="p-5 md:p-7 space-y-6 max-w-7xl mx-auto w-full">

        {/* ── Header ── */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              {/* Robotics accent bar */}
              <div className="flex flex-col gap-[3px]">
                <div className="w-0.5 h-4 rounded-full" style={{ background: "#00f5ff", boxShadow: "0 0 8px rgba(0,245,255,0.7)" }} />
                <div className="w-0.5 h-2 rounded-full" style={{ background: "#8040ff", boxShadow: "0 0 6px rgba(128,64,255,0.6)" }} />
              </div>
              <div>
                <h1 className="font-display font-black text-xl md:text-2xl tracking-[0.18em]" style={{
                  background: "linear-gradient(90deg, #ffffff 0%, #00f5ff 55%, #8040ff 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                  MISSION CONTROL
                </h1>
                <p className="font-mono text-[0.6875rem] text-muted-foreground tracking-widest mt-0.5">
                  Lead pipeline active ·{" "}
                  {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>
          <Link href="/campaigns/new">
            <button className="cyber-button-primary flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5" /> Launch Mission
            </button>
          </Link>
        </header>

        {/* ── KPI Row ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Total Contacts"    value={stats.totalContacts}          change={stats.totalContactsChange}     accent="cyan" />
            <StatCard title="Trial Attendees"   value={stats.trialAttendees}         change={stats.trialAttendeesChange}    accent="purple" />
            <StatCard title="Active Campaigns"  value={stats.activeCampaigns}        change={stats.activeCampaignsChange}   accent="green" />
            <StatCard title="Conversions"       value={stats.conversionsThisMonth}   change={stats.conversionsChange}       accent="yellow" />
            <StatCard title="Conv. Rate"        value={stats.overallConversionRate}  change={2.4} isPercent                 accent="cyan" />
            <StatCard title="Pending Follow-ups" value={stats.pendingFollowUps}      change={-5}  invertTrend               accent="pink" />
          </div>
        )}

        {/* ── Funnel + Lead Sources ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Conversion Pipeline */}
          <div className="cyber-card robo-card p-5 lg:col-span-2">
            <SectionHeading icon={TrendingUp} label="Conversion Pipeline" accent="cyan" />
            <div className="space-y-2.5">
              {(funnelData ?? []).map((stage, i) => {
                const maxCount = funnelData?.[0]?.count ?? 1;
                const pct = Math.round((stage.count / maxCount) * 100);
                const barColor = i === 0 ? "#00f5ff" : i < 3 ? "#8040ff" : i < 5 ? "#00eb7e" : "#ffc800";
                return (
                  <div key={stage.name} className="flex items-center gap-3">
                    <span className="font-mono text-[0.6875rem] text-muted-foreground w-28 shrink-0 text-right tracking-wide">{stage.name}</span>
                    <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded transition-all duration-700" style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${barColor}cc, ${barColor}55)`,
                        boxShadow: `0 0 6px ${barColor}50`,
                      }} />
                    </div>
                    <span className="font-display font-bold text-xs w-9 shrink-0 text-right" style={{ color: barColor }}>{stage.count}</span>
                    <span className="font-mono text-[0.6875rem] text-muted-foreground w-9 shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Sources Donut */}
          <div className="cyber-card robo-card p-5">
            <SectionHeading icon={Target} label="Lead Sources" accent="purple" />
            <div className="h-[160px]">
              {leadSources && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadSources} cx="50%" cy="50%" innerRadius={44} outerRadius={62} paddingAngle={3} dataKey="count" nameKey="source">
                      {leadSources.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} style={{ filter: `drop-shadow(0 0 4px ${PIE_COLORS[i % PIE_COLORS.length]}70)` }} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0a0a1e", border: "1px solid rgba(0,245,255,0.18)", fontFamily: "JetBrains Mono", fontSize: 11, borderRadius: 6 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-1.5 mt-1">
              {(leadSources ?? []).slice(0, 4).map((s, i) => (
                <div key={s.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length], boxShadow: `0 0 4px ${PIE_COLORS[i % PIE_COLORS.length]}` }} />
                    <span className="font-mono text-xs text-muted-foreground capitalize">{s.source}</span>
                  </div>
                  <span className="font-display font-bold text-xs text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Campaign Performance Bar Chart ── */}
        <div className="cyber-card robo-card p-5">
          <SectionHeading icon={Radio} label="Campaign Performance — Last 6" accent="green" />
          <div className="h-[210px]">
            {performanceData && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barGap={3}>
                  <XAxis dataKey="name" stroke="#55557a" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#55557a" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <Tooltip
                    cursor={{ fill: "rgba(0,245,255,0.035)" }}
                    contentStyle={{ background: "#0a0a1e", border: "1px solid rgba(0,245,255,0.18)", fontFamily: "JetBrains Mono", fontSize: 11, borderRadius: 6 }}
                    itemStyle={{ color: "#e8eaf0" }}
                  />
                  <Bar dataKey="sent"      fill={CHART_COLORS.cyan}   radius={[2, 2, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="opened"    fill={CHART_COLORS.purple} radius={[2, 2, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="clicked"   fill={CHART_COLORS.green}  radius={[2, 2, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="converted" fill={CHART_COLORS.yellow} radius={[2, 2, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-2">
            {[["Sent", "#00f5ff"], ["Opened", "#8040ff"], ["Clicked", "#00eb7e"], ["Converted", "#ffc800"]].map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                <span className="font-mono text-[0.6875rem] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity Feed + Campaign Queue ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Activity Feed */}
          <div className="cyber-card robo-card flex flex-col overflow-hidden" style={{ maxHeight: 380 }}>
            <div className="px-5 pt-5 pb-4 border-b shrink-0" style={{ borderColor: "rgba(0,245,255,0.07)" }}>
              <SectionHeading icon={Activity} label="Live Activity Feed" accent="cyan" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {(activities ?? []).map((act) => {
                const cfg = ACTIVITY_ICONS[act.type] ?? ACTIVITY_ICONS.note;
                const Icon = cfg.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3 px-5 py-3 border-b transition-colors cursor-default"
                    style={{ borderColor: "rgba(255,255,255,0.035)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,245,255,0.025)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-snug">
                        <span className="font-semibold">{act.contactName ?? "Unknown"}</span>{" "}
                        <span className="text-muted-foreground text-xs">{act.description}</span>
                      </p>
                      <p className="font-mono text-[0.6875rem] text-muted-foreground mt-0.5 leading-tight">
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

          {/* Campaign Queue */}
          <div className="cyber-card robo-card flex flex-col overflow-hidden" style={{ maxHeight: 380 }}>
            <div className="px-5 pt-5 pb-4 border-b shrink-0 flex items-center justify-between" style={{ borderColor: "rgba(0,245,255,0.07)" }}>
              <SectionHeading icon={Radio} label="Campaign Queue" accent="yellow" />
              <Link href="/campaigns/new">
                <button className="cyber-button-accent flex items-center gap-1.5" style={{ marginTop: "-20px" }}>
                  <Zap className="w-3 h-3" /> New
                </button>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(campaigns ?? []).slice(0, 6).map((camp) => (
                <div key={camp.id} className="flex items-center gap-3 px-5 py-3 border-b group transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.035)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(128,64,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-display font-bold text-xs text-white group-hover:text-cyan transition-colors">{camp.name}</p>
                      <StatusBadge status={camp.status} />
                    </div>
                    <p className="font-mono text-[0.6875rem] text-muted-foreground leading-tight">
                      {camp.segmentName ?? "All Contacts"} · {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleDateString() : "Unscheduled"}
                    </p>
                  </div>
                  <Link href={`/campaigns/${camp.id}`}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0"
                      style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.18)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#00f5ff"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 10px rgba(0,245,255,0.45)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.07)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                      <Eye className="w-3.5 h-3.5 text-cyan" />
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
