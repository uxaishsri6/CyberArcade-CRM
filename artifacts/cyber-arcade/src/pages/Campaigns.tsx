import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useGetCampaigns } from "@workspace/api-client-react";
import { Radio, Plus, Mail, MessageSquare, Smartphone, Instagram, Facebook, BarChart2, MoreVertical } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";

const CHANNEL_ICONS: Record<string, any> = {
  email: Mail,
  whatsapp: MessageSquare,
  sms: Smartphone,
  instagram: Instagram,
  facebook: Facebook,
};

export default function Campaigns() {
  const { data: campaigns, isLoading } = useGetCampaigns();

  return (
    <AppLayout>
      <PageTransition className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-gradient tracking-widest mb-1 flex items-center gap-3">
              <Radio className="w-8 h-8 text-cyan drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
              TRANSMISSION CONTROL
            </h1>
            <p className="text-muted-foreground font-mono text-sm">Manage multi-channel outreach missions.</p>
          </div>
          <Link href="/campaigns/new" className="cyber-button-primary px-6 py-3 flex items-center gap-2">
            <Plus className="w-5 h-5" /> LAUNCH NEW MISSION
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 border-b border-white/5 font-mono text-sm tracking-widest uppercase">
          {['All', 'Active', 'Scheduled', 'Draft', 'Paused', 'Completed'].map((tab, i) => (
            <button 
              key={tab}
              className={`px-6 py-2 border-b-2 whitespace-nowrap transition-colors ${i === 0 ? 'border-cyan text-cyan text-shadow-glow' : 'border-transparent text-muted-foreground hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 cyber-card animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {campaigns?.map((campaign) => (
              <div key={campaign.id} className="cyber-card p-6 flex flex-col group hover:border-cyan/30 transition-colors relative overflow-hidden">
                
                {/* Active pulse indicator */}
                {campaign.status === 'active' && (
                  <div className="absolute top-6 right-6 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan"></span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-xl text-white truncate">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan uppercase">{campaign.goal.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="truncate">Target: {campaign.segmentName || 'All Contacts'}</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-white mt-1">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  {campaign.channels.map(ch => {
                    const Icon = CHANNEL_ICONS[ch.toLowerCase()] || Radio;
                    return (
                      <div key={ch} className="w-8 h-8 rounded bg-elevated border border-white/10 flex items-center justify-center text-muted-foreground tooltip-trigger" title={ch}>
                        <Icon className="w-4 h-4" />
                      </div>
                    );
                  })}
                  <div className="ml-auto text-xs font-mono text-muted-foreground">
                    {campaign.scheduledAt ? `Scheduled: ${new Date(campaign.scheduledAt).toLocaleDateString()}` : 'Created: ' + new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4 mt-auto">
                  <div className="text-center">
                    <p className="text-[10px] font-mono text-muted-foreground mb-1 uppercase">Sent</p>
                    <p className="font-display font-bold text-cyan">{campaign.sentCount}</p>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <p className="text-[10px] font-mono text-muted-foreground mb-1 uppercase">Opened</p>
                    <p className="font-display font-bold text-purple">{campaign.openCount}</p>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <p className="text-[10px] font-mono text-muted-foreground mb-1 uppercase">Clicked</p>
                    <p className="font-display font-bold text-yellow">{campaign.clickCount}</p>
                  </div>
                  <div className="text-center border-l border-white/5 bg-green/5 -m-4 ml-2 p-4 rounded-br-xl">
                    <p className="text-[10px] font-mono text-green mb-1 uppercase">Converted</p>
                    <p className="font-display font-bold text-green drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]">{campaign.conversionCount}</p>
                  </div>
                </div>
                
                {/* Actions Overlay on Hover */}
                <div className="absolute inset-0 bg-card/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Link href={`/campaigns/${campaign.id}`} className="cyber-button-primary px-6 py-2 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" /> ANALYTICS
                  </Link>
                  <button className="cyber-button-secondary px-4 py-2">EDIT</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </AppLayout>
  );
}
