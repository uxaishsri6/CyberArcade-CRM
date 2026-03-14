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
import { Activity, ArrowUpRight, ArrowDownRight, Bot, Users, Target, Phone, Mail, MessageSquare, GraduationCap, Play, TrendingUp, Radio } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";

const CHART_COLORS = {
  cyan: "hsl(182, 100%, 50%)",
  purple: "hsl(275, 100%, 65%)",
  green: "hsl(152, 100%, 50%)",
  yellow: "hsl(51, 100%, 60%)",
  pink: "hsl(339, 100%, 59%)"
};

function StatCard({ title, value, change, isPercent = false, invertTrend = false }: { title: string, value: number, change: number, isPercent?: boolean, invertTrend?: boolean }) {
  const isPositive = change >= 0;
  const isGood = invertTrend ? !isPositive : isPositive;
  
  return (
    <div className="cyber-card p-5 group hover:border-cyan/50 transition-colors">
      <h3 className="font-mono text-muted-foreground text-xs uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-end gap-3">
        <span className="font-display font-bold text-3xl text-white group-hover:text-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.5)] transition-all">
          {value}{isPercent ? '%' : ''}
        </span>
        <span className={`flex items-center text-xs font-mono mb-1 ${isGood ? 'text-green' : 'text-pink'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, any> = {
  note: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-400/10" },
  call: { icon: Phone, color: "text-yellow", bg: "bg-yellow/10" },
  email_sent: { icon: Mail, color: "text-purple", bg: "bg-purple/10" },
  whatsapp_sent: { icon: MessageSquare, color: "text-green", bg: "bg-green/10" },
  status_change: { icon: Target, color: "text-cyan", bg: "bg-cyan/10" },
  enrolled: { icon: GraduationCap, color: "text-pink", bg: "bg-pink/10" },
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: funnelData, isLoading: funnelLoading } = useGetDashboardFunnel();
  const { data: performanceData, isLoading: perfLoading } = useGetDashboardCampaignPerformance();
  const { data: leadSources, isLoading: sourcesLoading } = useGetDashboardLeadSources();
  const { data: activities, isLoading: actsLoading } = useGetDashboardRecentActivities();
  const { data: campaigns, isLoading: campsLoading } = useGetCampaigns({ status: 'scheduled' });

  const isLoading = statsLoading || funnelLoading || perfLoading || sourcesLoading || actsLoading || campsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8 space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-elevated rounded mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 cyber-card"></div>)}
          </div>
          <div className="h-64 cyber-card"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-80 cyber-card lg:col-span-2"></div>
            <div className="h-80 cyber-card"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        <header>
          <h1 className="text-2xl md:text-3xl font-display text-gradient tracking-widest mb-2">MISSION CONTROL DASHBOARD</h1>
          <p className="text-muted-foreground font-mono text-sm">System status normal. Lead pipeline active.</p>
        </header>

        {/* KPI Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Contacts" value={stats.totalContacts} change={stats.totalContactsChange} />
            <StatCard title="Trial Attendees" value={stats.trialAttendees} change={stats.trialAttendeesChange} />
            <StatCard title="Active Campaigns" value={stats.activeCampaigns} change={stats.activeCampaignsChange} />
            <StatCard title="Conversions" value={stats.conversionsThisMonth} change={stats.conversionsChange} />
            <StatCard title="Conv. Rate" value={stats.overallConversionRate} change={2.4} isPercent />
            <StatCard title="Pending Follow-ups" value={stats.pendingFollowUps} change={-5} invertTrend />
          </div>
        )}

        {/* Funnel */}
        <div className="cyber-card p-6">
          <h2 className="font-display text-lg text-cyan mb-6 tracking-widest flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> CONVERSION PIPELINE
          </h2>
          <div className="h-[200px] w-full">
            {funnelData && (
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Funnel
                    dataKey="count"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" className="font-mono text-xs" />
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#funnelGradient${index})`} />
                    ))}
                  </Funnel>
                  <defs>
                    {funnelData?.map((_, index) => (
                      <linearGradient key={`gradient-${index}`} id={`funnelGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={1 - (index * 0.15)} />
                        <stop offset="100%" stopColor={CHART_COLORS.purple} stopOpacity={1 - (index * 0.15)} />
                      </linearGradient>
                    ))}
                  </defs>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance */}
          <div className="cyber-card p-6 lg:col-span-2">
            <h2 className="font-display text-lg text-cyan mb-6 tracking-widest flex items-center gap-2">
              <Radio className="w-5 h-5" /> CAMPAIGN PERFORMANCE (LAST 6)
            </h2>
            <div className="h-[300px] w-full">
              {performanceData && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#8888bb" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8888bb" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }}
                    />
                    <Bar dataKey="sent" fill={CHART_COLORS.cyan} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="opened" fill={CHART_COLORS.purple} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="clicked" fill={CHART_COLORS.green} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="converted" fill={CHART_COLORS.yellow} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="cyber-card p-6">
            <h2 className="font-display text-lg text-cyan mb-6 tracking-widest flex items-center gap-2">
              <Target className="w-5 h-5" /> LEAD SOURCES
            </h2>
            <div className="h-[300px] w-full relative">
              {leadSources && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="source"
                    >
                      {leadSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="cyber-card flex flex-col h-[400px]">
            <div className="p-6 border-b border-white/5 shrink-0">
              <h2 className="font-display text-lg text-cyan tracking-widest flex items-center gap-2">
                <Activity className="w-5 h-5" /> RECENT ACTIVITY FEED
              </h2>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {activities?.map((act) => {
                const IconConfig = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.note;
                const Icon = IconConfig.icon;
                return (
                  <div key={act.id} className="flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${IconConfig.bg} ${IconConfig.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-bold">{act.contactName || 'Unknown Contact'}</span>{' '}
                        <span className="text-muted-foreground">{act.description}</span>
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                        {act.createdBy && ` • by ${act.createdBy}`}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!activities || activities.length === 0) && (
                <div className="p-8 text-center text-muted-foreground font-mono">No recent activity detected.</div>
              )}
            </div>
          </div>

          {/* Upcoming Campaigns */}
          <div className="cyber-card flex flex-col h-[400px]">
            <div className="p-6 border-b border-white/5 shrink-0 flex justify-between items-center">
              <h2 className="font-display text-lg text-cyan tracking-widest flex items-center gap-2">
                <Radio className="w-5 h-5" /> UPCOMING CAMPAIGNS
              </h2>
              <Link href="/campaigns/new" className="text-xs font-mono text-cyan hover:text-white transition-colors">
                + NEW
              </Link>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {campaigns?.slice(0,5).map((camp) => (
                <div key={camp.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-bold text-white group-hover:text-cyan transition-colors">{camp.name}</h4>
                      <StatusBadge status={camp.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                      <span>{camp.segmentName || 'All Contacts'}</span>
                      <span>•</span>
                      <span>{camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleDateString() : 'Unscheduled'}</span>
                    </div>
                  </div>
                  <Link href={`/campaigns/${camp.id}`} className="w-8 h-8 rounded bg-elevated border border-white/10 flex items-center justify-center text-cyan hover:bg-cyan hover:text-black transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </Link>
                </div>
              ))}
              {(!campaigns || campaigns.length === 0) && (
                <div className="p-8 text-center text-muted-foreground font-mono">No scheduled campaigns.</div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
