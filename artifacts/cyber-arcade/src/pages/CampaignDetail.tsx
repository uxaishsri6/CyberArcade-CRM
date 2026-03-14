import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useGetCampaign, useGetCampaignLogs, useGetCampaignTimeline, usePauseCampaign, useDuplicateCampaign, useDeleteCampaign } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Pause, Play, Copy, Trash2, Mail, MessageSquare, Smartphone, Instagram, Facebook, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";

const CHART_COLORS = {
  cyan: "hsl(182, 100%, 50%)",
  purple: "hsl(275, 100%, 65%)",
  green: "hsl(152, 100%, 50%)",
};

const CHANNEL_ICONS: Record<string, any> = {
  email: Mail, whatsapp: MessageSquare, sms: Smartphone,
  instagram: Instagram, facebook: Facebook,
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="cyber-card p-5">
      <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display font-bold text-2xl text-cyan">{value}</p>
      {sub && <p className="font-mono text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:id");
  const [, navigate] = useLocation();
  const id = params?.id ?? "";

  const { data: campaign, isLoading } = useGetCampaign(id);
  const { data: logs } = useGetCampaignLogs(id);
  const { data: timeline } = useGetCampaignTimeline(id);
  const pauseMutation = usePauseCampaign();
  const dupMutation = useDuplicateCampaign();
  const deleteMutation = useDeleteCampaign();

  if (isLoading || !campaign) {
    return (
      <AppLayout>
        <div className="p-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  const openRate = campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : "0.0";
  const clickRate = campaign.sentCount > 0 ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(1) : "0.0";
  const delivered = Math.floor(campaign.sentCount * 0.95);
  const channels = campaign.channels ?? [];

  const channelBreakdown = channels.map(ch => ({
    channel: ch,
    sent: Math.floor(campaign.sentCount / channels.length),
    delivered: Math.floor(delivered / channels.length),
    opened: Math.floor(campaign.openCount / channels.length),
    clicked: Math.floor(campaign.clickCount / channels.length),
    converted: Math.floor(campaign.conversionCount / channels.length),
  }));

  const convertedLogs = (logs ?? []).filter(l => l.convertedAt);

  const exportCSV = () => {
    const rows = (logs ?? []).map(l =>
      [l.contactId, l.contactName ?? "", l.contactEmail ?? "", l.channel, l.status, l.sentAt ?? "", l.openedAt ?? "", l.clickedAt ?? ""].join(",")
    );
    const csv = ["contactId,name,email,channel,status,sentAt,openedAt,clickedAt", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `campaign-${id}-logs.csv`; a.click();
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/campaigns" className="w-8 h-8 rounded bg-card border border-white/10 flex items-center justify-center hover:border-cyan transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div>
                <h1 className="font-display font-bold text-2xl text-white tracking-widest">{campaign.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={campaign.status} />
                  <span className="font-mono text-xs text-muted-foreground">{campaign.goal.replace("_", " ").toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => pauseMutation.mutate({ id })}
                className="flex items-center gap-2 px-3 py-2 rounded bg-card border border-white/10 text-sm font-mono hover:border-cyan transition-colors"
              >
                {campaign.status === "paused" ? <Play className="w-4 h-4 text-green" /> : <Pause className="w-4 h-4 text-yellow" />}
                {campaign.status === "paused" ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => dupMutation.mutate({ id }, { onSuccess: (data) => navigate(`/campaigns/${data.id}`) })}
                className="flex items-center gap-2 px-3 py-2 rounded bg-card border border-white/10 text-sm font-mono hover:border-purple transition-colors"
              >
                <Copy className="w-4 h-4 text-purple" /> Duplicate
              </button>
              <button
                onClick={() => { if (confirm("Delete this campaign?")) deleteMutation.mutate({ id }, { onSuccess: () => navigate("/campaigns") }); }}
                className="flex items-center gap-2 px-3 py-2 rounded bg-card border border-pink/30 text-sm font-mono hover:border-pink text-pink transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Sent" value={campaign.sentCount} />
            <StatCard label="Delivered" value={delivered} sub="~95% delivery rate" />
            <StatCard label="Open Rate" value={`${openRate}%`} />
            <StatCard label="Click Rate" value={`${clickRate}%`} />
            <StatCard label="Conversions" value={campaign.conversionCount} sub="Enrolled" />
          </div>

          {/* Channel Breakdown */}
          <div className="cyber-card p-6">
            <h2 className="font-display text-lg text-cyan tracking-widest mb-4">CHANNEL BREAKDOWN</h2>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted-foreground">
                    <th className="text-left p-3">CHANNEL</th>
                    <th className="text-right p-3">SENT</th>
                    <th className="text-right p-3">DELIVERED</th>
                    <th className="text-right p-3">OPENED</th>
                    <th className="text-right p-3">CLICKED</th>
                    <th className="text-right p-3">CONVERTED</th>
                  </tr>
                </thead>
                <tbody>
                  {channelBreakdown.map(ch => {
                    const Icon = CHANNEL_ICONS[ch.channel] ?? Mail;
                    return (
                      <tr key={ch.channel} className="border-b border-white/5 hover:border-l-2 hover:border-l-cyan transition-colors">
                        <td className="p-3 flex items-center gap-2 capitalize">
                          <Icon className="w-4 h-4 text-cyan" /> {ch.channel}
                        </td>
                        <td className="p-3 text-right">{ch.sent}</td>
                        <td className="p-3 text-right text-green">{ch.delivered}</td>
                        <td className="p-3 text-right text-purple">{ch.opened}</td>
                        <td className="p-3 text-right text-yellow">{ch.clicked}</td>
                        <td className="p-3 text-right text-cyan font-bold">{ch.converted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engagement Timeline */}
          {timeline && timeline.length > 0 && (
            <div className="cyber-card p-6">
              <h2 className="font-display text-lg text-cyan tracking-widest mb-4">ENGAGEMENT TIMELINE</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline}>
                    <XAxis dataKey="date" stroke="#8888bb" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8888bb" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }} />
                    <Line type="monotone" dataKey="opens" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} name="Opens" />
                    <Line type="monotone" dataKey="clicks" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} name="Clicks" />
                    <Line type="monotone" dataKey="conversions" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Converted Contacts */}
          {convertedLogs.length > 0 && (
            <div className="cyber-card p-6">
              <h2 className="font-display text-lg text-cyan tracking-widest mb-4">CONVERTED CONTACTS ({convertedLogs.length})</h2>
              <div className="space-y-2">
                {convertedLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-green/5 border border-green/20 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green/20 border border-green/40 flex items-center justify-center font-display font-bold text-xs text-green">
                      {(log.contactName ?? "?").charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm text-white">{log.contactName ?? "Unknown"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{log.contactEmail}</p>
                    </div>
                    <span className="font-mono text-xs text-green">
                      {log.convertedAt ? format(parseISO(log.convertedAt), "MMM d") : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Log */}
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-cyan tracking-widest">CONTACT RESPONSE LOG</h2>
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 rounded bg-card border border-white/10 text-xs font-mono hover:border-cyan transition-colors">
                <Download className="w-3.5 h-3.5 text-cyan" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground">
                    <th className="text-left p-2">CONTACT</th>
                    <th className="text-left p-2">CHANNEL</th>
                    <th className="text-left p-2">STATUS</th>
                    <th className="text-left p-2">SENT AT</th>
                    <th className="text-left p-2">OPENED</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs ?? []).slice(0, 50).map(log => (
                    <tr key={log.id} className="border-b border-white/5 hover:border-l-2 hover:border-l-cyan transition-all">
                      <td className="p-2">
                        <div className="font-bold text-white">{log.contactName ?? "—"}</div>
                        <div className="text-muted-foreground">{log.contactEmail}</div>
                      </td>
                      <td className="p-2 capitalize text-purple">{log.channel}</td>
                      <td className="p-2"><StatusBadge status={log.status} /></td>
                      <td className="p-2 text-muted-foreground">{log.sentAt ? format(parseISO(log.sentAt), "MMM d HH:mm") : "—"}</td>
                      <td className="p-2 text-muted-foreground">{log.openedAt ? format(parseISO(log.openedAt), "MMM d HH:mm") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
