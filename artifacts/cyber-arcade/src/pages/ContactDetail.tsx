import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useGetContact, useGetContactActivities, useGetContactCampaigns, useUpdateContact, useCreateContactActivity } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { useState } from "react";
import { ArrowLeft, Mail, MessageSquare, Phone, Plus, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  cold_lead: "#3b82f6", warm_lead: "#ffe033", trial_attended: "#b44aff",
  interested: "#00f5ff", enrolled: "#00ff88", churned: "#ff2d78",
};
const ACT_ICONS: Record<string, string> = {
  note: "📝", call: "📞", email_sent: "✉️", whatsapp_sent: "💬", status_change: "🔄", enrolled: "🎓"
};
const STATUSES = ["cold_lead", "warm_lead", "trial_attended", "interested", "enrolled", "churned"];

export default function ContactDetail() {
  const [, params] = useRoute("/contacts/:id");
  const id = params?.id ?? "";

  const { data: contact, isLoading, refetch } = useGetContact(id);
  const { data: activities, refetch: refetchActs } = useGetContactActivities(id);
  const { data: campaignLogs } = useGetContactCampaigns(id);
  const updateMutation = useUpdateContact();
  const addActivityMutation = useCreateContactActivity();

  const [activeTab, setActiveTab] = useState<"timeline" | "campaigns" | "notes">("timeline");
  const [newTag, setNewTag] = useState("");
  const [newNote, setNewNote] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);

  if (isLoading || !contact) {
    return (
      <AppLayout>
        <div className="p-8 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}
        </div>
      </AppLayout>
    );
  }

  const initials = `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase();
  const glowColor = STATUS_COLORS[contact.status] ?? "#00f5ff";

  const addTag = () => {
    if (!newTag.trim()) return;
    const tags = [...(contact.tags ?? []), newTag.trim()];
    updateMutation.mutate({ id, data: { tags } }, { onSuccess: () => { refetch(); setNewTag(""); } });
  };

  const removeTag = (tag: string) => {
    const tags = (contact.tags ?? []).filter(t => t !== tag);
    updateMutation.mutate({ id, data: { tags } }, { onSuccess: () => refetch() });
  };

  const changeStatus = (status: string) => {
    updateMutation.mutate({ id, data: { status: status as any } }, { onSuccess: () => refetch() });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    addActivityMutation.mutate({ id, data: { type: "note", description: newNote, createdBy: "Admin" } }, {
      onSuccess: () => { refetchActs(); setNewNote(""); setShowNoteForm(false); }
    });
  };

  const logQuickAction = (type: string, desc: string) => {
    addActivityMutation.mutate({ id, data: { type: type as any, description: desc, createdBy: "Admin" } }, {
      onSuccess: () => refetchActs()
    });
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/contacts" className="w-8 h-8 rounded bg-card border border-white/10 flex items-center justify-center hover:border-cyan transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <h1 className="font-display text-xl text-gradient tracking-widest">CONTACT PROFILE</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Avatar + Info */}
              <div className="cyber-card p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-2xl text-white"
                    style={{ background: `linear-gradient(135deg, ${glowColor}22, ${glowColor}44)`, boxShadow: `0 0 0 2px ${glowColor}, 0 0 20px ${glowColor}66` }}>
                    {initials}
                  </div>
                </div>
                <h2 className="font-display font-bold text-xl text-white">{contact.firstName} {contact.lastName}</h2>
                <p className="font-mono text-sm text-muted-foreground">{contact.email}</p>
                <div className="mt-2 flex justify-center"><StatusBadge status={contact.status} /></div>

                <div className="mt-4 space-y-2 text-left">
                  {contact.phone && <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground"><Phone className="w-4 h-4 text-cyan" />{contact.phone}</div>}
                  {contact.whatsapp && <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground"><MessageSquare className="w-4 h-4 text-green" />{contact.whatsapp}</div>}
                  {contact.city && <div className="font-mono text-sm text-muted-foreground">📍 {contact.city}</div>}
                </div>

                {contact.childName && (
                  <div className="mt-4 p-3 bg-purple/10 border border-purple/20 rounded-lg text-left">
                    <p className="font-mono text-xs text-purple uppercase tracking-wider mb-1">Child Info</p>
                    <p className="font-display font-bold text-sm text-white">{contact.childName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{contact.childAge} yrs · {contact.childGrade}</p>
                    {contact.trialAttended && <p className="font-mono text-xs text-green mt-1">✓ Trial Attended — {contact.trialBatch}</p>}
                  </div>
                )}
              </div>

              {/* Lead Score */}
              <div className="cyber-card p-5">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">Lead Score</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-3xl text-cyan">{contact.leadScore}</span>
                  <span className="font-mono text-xs text-muted-foreground">/100</span>
                </div>
                <div className="h-2 bg-card rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan to-purple transition-all duration-700" style={{ width: `${contact.leadScore}%` }} />
                </div>
              </div>

              {/* Tags */}
              <div className="cyber-card p-5">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">Tags</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(contact.tags ?? []).map(tag => (
                    <span key={tag} className="flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">
                      {tag} <button onClick={() => removeTag(tag)} className="hover:text-pink transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="Add tag..." className="flex-1 cyber-input px-2 py-1 text-xs" />
                  <button onClick={addTag} className="px-2 py-1 rounded bg-cyan/20 border border-cyan/40 text-cyan text-xs hover:bg-cyan/30 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="cyber-card p-5 space-y-2">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
                <button onClick={() => logQuickAction("email_sent", "Sent follow-up email to contact.")} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-card border border-white/10 text-sm font-mono hover:border-cyan transition-colors">
                  <Mail className="w-4 h-4 text-cyan" /> Send Email
                </button>
                <button onClick={() => logQuickAction("whatsapp_sent", "Sent WhatsApp message to contact.")} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-card border border-white/10 text-sm font-mono hover:border-green transition-colors">
                  <MessageSquare className="w-4 h-4 text-green" /> Send WhatsApp
                </button>
                <button onClick={() => logQuickAction("call", "Called contact regarding enrollment.")} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-card border border-white/10 text-sm font-mono hover:border-yellow transition-colors">
                  <Phone className="w-4 h-4 text-yellow" /> Log Call
                </button>
                <div className="pt-2 border-t border-white/5">
                  <p className="font-mono text-xs text-muted-foreground mb-2">Change Status</p>
                  <div className="grid grid-cols-2 gap-1">
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => changeStatus(s)}
                        className={`px-2 py-1 rounded text-xs font-mono capitalize transition-colors ${contact.status === s ? "bg-cyan/20 border border-cyan/40 text-cyan" : "bg-card border border-white/10 text-muted-foreground hover:border-white/20"}`}>
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-3">
              <div className="cyber-card h-full">
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  {(["timeline", "campaigns", "notes"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 font-display text-sm uppercase tracking-wider transition-colors ${activeTab === tab ? "text-cyan border-b-2 border-cyan" : "text-muted-foreground hover:text-white"}`}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "timeline" && (
                    <div className="space-y-4">
                      {(activities ?? []).length === 0 && <p className="font-mono text-sm text-muted-foreground text-center py-8">🤖 No activities yet. Log a call or send a message to start.</p>}
                      {(activities ?? []).map(act => (
                        <div key={act.id} className="flex gap-3 relative">
                          <div className="w-8 h-8 rounded-full bg-card border border-white/10 flex items-center justify-center flex-shrink-0 text-sm">
                            {ACT_ICONS[act.type] ?? "📌"}
                          </div>
                          <div className="flex-1 pb-4 border-b border-white/5">
                            <p className="font-mono text-sm text-white">{act.description}</p>
                            <p className="font-mono text-xs text-muted-foreground mt-1">
                              {act.createdBy ?? "System"} · {formatDistanceToNow(parseISO(act.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "campaigns" && (
                    <div className="space-y-3">
                      {(campaignLogs ?? []).length === 0 && <p className="font-mono text-sm text-muted-foreground text-center py-8">🤖 Contact not in any campaigns yet.</p>}
                      {(campaignLogs ?? []).map(log => (
                        <div key={log.id} className="p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-display font-bold text-sm text-white">{log.campaignId.substring(0, 8)}...</p>
                              <p className="font-mono text-xs text-muted-foreground capitalize">{log.channel} · {log.sentAt ? formatDistanceToNow(parseISO(log.sentAt), { addSuffix: true }) : "—"}</p>
                            </div>
                            <StatusBadge status={log.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "notes" && (
                    <div className="space-y-4">
                      {!showNoteForm ? (
                        <button onClick={() => setShowNoteForm(true)} className="cyber-button-secondary w-full py-2 text-sm flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> ADD NOTE
                        </button>
                      ) : (
                        <div className="space-y-3 p-3 bg-card/50 rounded-lg border border-white/10">
                          <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." rows={3} className="w-full cyber-input px-3 py-2 resize-none text-sm" />
                          <div className="flex gap-2">
                            <button onClick={addNote} disabled={addActivityMutation.isPending} className="cyber-button-primary px-4 py-1.5 text-xs">SAVE</button>
                            <button onClick={() => { setShowNoteForm(false); setNewNote(""); }} className="cyber-button-secondary px-4 py-1.5 text-xs">CANCEL</button>
                          </div>
                        </div>
                      )}
                      {(activities ?? []).filter(a => a.type === "note").map(act => (
                        <div key={act.id} className="p-3 bg-card/50 rounded-lg border border-white/10">
                          <p className="font-mono text-sm text-white">{act.description}</p>
                          <p className="font-mono text-xs text-muted-foreground mt-2">{act.createdBy ?? "Admin"} · {formatDistanceToNow(parseISO(act.createdAt), { addSuffix: true })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
