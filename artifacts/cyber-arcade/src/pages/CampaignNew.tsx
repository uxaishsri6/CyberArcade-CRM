import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useState } from "react";
import { useCreateCampaign, useGetSegments } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Mail, MessageSquare, Smartphone, Instagram, Facebook, Check, Rocket, Save } from "lucide-react";

const GOALS = [
  { value: "enroll_trial", label: "Convert Trial", desc: "Convert trial attendees to paid students", color: "text-cyan" },
  { value: "new_acquisition", label: "New Acquisition", desc: "Reach brand-new prospective parents", color: "text-purple" },
  { value: "re_engage", label: "Re-Engage", desc: "Win back dormant or lost leads", color: "text-yellow" },
  { value: "batch_announce", label: "Batch Announce", desc: "Announce new batch schedule", color: "text-green" },
  { value: "awareness", label: "Awareness", desc: "Build brand awareness in your city", color: "text-pink" },
];

const CHANNELS = [
  { value: "email", label: "Email", icon: Mail, color: "#00f5ff", desc: "HTML email via SendGrid" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "#00ff88", desc: "Template messages via Twilio" },
  { value: "sms", label: "SMS", icon: Smartphone, color: "#ffe033", desc: "Text messages via Twilio" },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "#b44aff", desc: "Creative + caption for manual posting" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "#ff2d78", desc: "Ad copy for Facebook campaign" },
];

const TOKENS = ["{{firstName}}", "{{childName}}", "{{trialDate}}", "{{batchName}}", "{{city}}"];

export default function CampaignNew() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const { data: segments } = useGetSegments();
  const createMutation = useCreateCampaign();

  const [form, setForm] = useState({
    name: "",
    goal: "enroll_trial" as string,
    segmentId: null as string | null,
    scheduledAt: "",
    channels: [] as string[],
    subject: "",
    previewText: "",
    messageBody: "",
    ctaText: "Enroll Now",
    ctaUrl: "https://cyberarcade.in/enroll",
    whatsappBody: "",
    smsBody: "",
    igCaption: "",
    fbCaption: "",
  });
  const [activeChannel, setActiveChannel] = useState("email");

  const toggleChannel = (ch: string) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch],
    }));
  };

  const handleLaunch = (asDraft = false) => {
    createMutation.mutate({
      data: {
        name: form.name || "New Campaign",
        goal: form.goal as any,
        channels: form.channels,
        segmentId: form.segmentId,
        scheduledAt: form.scheduledAt || null,
        subject: form.subject || null,
        messageBody: form.messageBody || form.whatsappBody || null,
        ctaText: form.ctaText || null,
        ctaUrl: form.ctaUrl || null,
        status: asDraft ? "draft" : "active",
      }
    }, { onSuccess: (data) => navigate(`/campaigns/${data.id}`) });
  };

  const steps = ["MISSION BRIEFING", "CHANNELS", "COMPOSE", "LAUNCH"];

  return (
    <AppLayout>
      <PageTransition>
        <div className="p-6 md:p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate("/campaigns")} className="w-8 h-8 rounded bg-card border border-white/10 flex items-center justify-center hover:border-cyan transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h1 className="font-display text-2xl text-gradient tracking-widest">LAUNCH NEW MISSION</h1>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-0">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-display font-bold text-xs flex-shrink-0 transition-all ${i + 1 < step ? "bg-cyan border-cyan text-black" : i + 1 === step ? "border-cyan text-cyan" : "border-white/20 text-muted-foreground"}`}>
                      {i + 1 < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`font-mono text-xs tracking-wider hidden md:block ${i + 1 === step ? "text-cyan" : "text-muted-foreground"}`}>{s}</span>
                    {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-all ${i + 1 < step ? "bg-cyan" : "bg-white/10"}`} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1 — Mission Briefing */}
          {step === 1 && (
            <div className="cyber-card p-6 space-y-5">
              <h2 className="font-display text-lg text-cyan tracking-widest mb-2">STEP 1: MISSION BRIEFING</h2>
              <div className="space-y-1">
                <label className="font-mono text-xs text-muted-foreground uppercase">Campaign Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. June Trial Conversion Drive" className="w-full cyber-input px-3 py-2" />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-muted-foreground uppercase">Campaign Goal</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GOALS.map(g => (
                    <button key={g.value} onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                      className={`p-3 rounded-lg border text-left transition-all ${form.goal === g.value ? "border-cyan bg-cyan/10" : "border-white/10 hover:border-white/20"}`}>
                      <p className={`font-display font-bold text-sm ${g.color}`}>{g.label}</p>
                      <p className="font-mono text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-xs text-muted-foreground uppercase">Target Segment</label>
                  <select value={form.segmentId ?? ""} onChange={e => setForm(f => ({ ...f, segmentId: e.target.value || null }))} className="w-full cyber-input px-3 py-2">
                    <option value="">All Contacts</option>
                    {(segments ?? []).map(s => <option key={s.id} value={s.id}>{s.name} ({s.contactCount} contacts)</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs text-muted-foreground uppercase">Scheduled Date & Time</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} className="w-full cyber-input px-3 py-2" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Channels */}
          {step === 2 && (
            <div className="cyber-card p-6 space-y-4">
              <h2 className="font-display text-lg text-cyan tracking-widest mb-2">STEP 2: SELECT CHANNELS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHANNELS.map(ch => {
                  const Icon = ch.icon;
                  const selected = form.channels.includes(ch.value);
                  return (
                    <button key={ch.value} onClick={() => toggleChannel(ch.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${selected ? "border-cyan bg-cyan/10" : "border-white/10 hover:border-white/20"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selected ? "bg-cyan/20" : "bg-card"}`}>
                          <Icon className="w-5 h-5" style={{ color: ch.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-bold text-sm text-white">{ch.label}</p>
                          <p className="font-mono text-xs text-muted-foreground">{ch.desc}</p>
                        </div>
                        {selected && <Check className="w-5 h-5 text-cyan" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {form.channels.length === 0 && <p className="font-mono text-xs text-pink text-center py-2">⚠ Select at least one channel to continue</p>}
            </div>
          )}

          {/* Step 3 — Compose */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 cyber-card p-6 space-y-4">
                <h2 className="font-display text-lg text-cyan tracking-widest mb-2">STEP 3: COMPOSE MESSAGES</h2>
                {/* Channel Tabs */}
                <div className="flex gap-1 bg-background/50 rounded-lg p-1">
                  {form.channels.map(ch => {
                    const cdef = CHANNELS.find(c => c.value === ch)!;
                    return (
                      <button key={ch} onClick={() => setActiveChannel(ch)}
                        className={`flex-1 py-1.5 rounded font-mono text-xs capitalize transition-all ${activeChannel === ch ? "bg-cyan/20 text-cyan" : "text-muted-foreground hover:text-white"}`}>
                        {ch}
                      </button>
                    );
                  })}
                </div>
                {activeChannel === "email" && form.channels.includes("email") && (
                  <div className="space-y-3">
                    <div><label className="font-mono text-xs text-muted-foreground">Subject Line</label><input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Your child's robotics journey starts here! 🤖" className="w-full cyber-input px-3 py-2 mt-1" /></div>
                    <div><label className="font-mono text-xs text-muted-foreground">Message Body</label><textarea value={form.messageBody} onChange={e => setForm(f => ({ ...f, messageBody: e.target.value }))} placeholder="Hi {{firstName}}, {{childName}} showed amazing interest..." rows={6} className="w-full cyber-input px-3 py-2 mt-1 resize-none" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="font-mono text-xs text-muted-foreground">CTA Text</label><input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} className="w-full cyber-input px-3 py-2 mt-1" /></div>
                      <div><label className="font-mono text-xs text-muted-foreground">CTA URL</label><input value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} className="w-full cyber-input px-3 py-2 mt-1" /></div>
                    </div>
                  </div>
                )}
                {activeChannel === "whatsapp" && form.channels.includes("whatsapp") && (
                  <div className="space-y-3">
                    <div><label className="font-mono text-xs text-muted-foreground">Template (max 1024 chars)</label>
                    <textarea value={form.whatsappBody} onChange={e => setForm(f => ({ ...f, whatsappBody: e.target.value.slice(0, 1024) }))} rows={6} className="w-full cyber-input px-3 py-2 mt-1 resize-none" />
                    <p className="font-mono text-xs text-muted-foreground text-right">{form.whatsappBody.length}/1024</p></div>
                  </div>
                )}
                {activeChannel === "sms" && form.channels.includes("sms") && (
                  <div className="space-y-3">
                    <div><label className="font-mono text-xs text-muted-foreground">Message (max 160 chars)</label>
                    <textarea value={form.smsBody} onChange={e => setForm(f => ({ ...f, smsBody: e.target.value.slice(0, 160) }))} rows={4} className="w-full cyber-input px-3 py-2 mt-1 resize-none" />
                    <p className={`font-mono text-xs text-right ${form.smsBody.length > 140 ? "text-pink" : "text-muted-foreground"}`}>{form.smsBody.length}/160</p></div>
                  </div>
                )}
                {(activeChannel === "instagram" || activeChannel === "facebook") && (
                  <div className="space-y-3">
                    <div><label className="font-mono text-xs text-muted-foreground">Caption</label><textarea rows={5} className="w-full cyber-input px-3 py-2 mt-1 resize-none" placeholder="Fuel your child's future with robotics..." /></div>
                    <div><label className="font-mono text-xs text-muted-foreground">Image URL</label><input className="w-full cyber-input px-3 py-2 mt-1" placeholder="https://..." /></div>
                    <div><label className="font-mono text-xs text-muted-foreground">Ad Headline</label><input className="w-full cyber-input px-3 py-2 mt-1" /></div>
                  </div>
                )}
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="font-mono text-xs text-muted-foreground mb-2">AVAILABLE TOKENS:</p>
                  <div className="flex flex-wrap gap-1">
                    {TOKENS.map(t => <span key={t} className="font-mono text-xs px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">{t}</span>)}
                  </div>
                </div>
              </div>
              {/* Phone Preview */}
              <div className="lg:col-span-2">
                <div className="sticky top-4">
                  <p className="font-mono text-xs text-muted-foreground text-center mb-3">LIVE PREVIEW</p>
                  <div className="bg-[#1a1a2e] border-4 border-white/10 rounded-3xl p-4 mx-auto max-w-[240px]">
                    <div className="bg-background rounded-2xl p-3 min-h-[300px]">
                      {activeChannel === "email" ? (
                        <div className="space-y-2">
                          <p className="font-mono text-xs text-muted-foreground">From: noreply@cyberarcade.in</p>
                          <p className="font-display font-bold text-xs text-white">{form.subject || "Subject line..."}</p>
                          <div className="border-t border-white/10 pt-2">
                            <p className="font-mono text-xs text-white/80 leading-relaxed">{form.messageBody.replace(/\{\{firstName\}\}/g, "Priya").replace(/\{\{childName\}\}/g, "Aarav") || "Message preview..."}</p>
                          </div>
                          {form.ctaText && <div className="bg-cyan text-black text-center font-display font-bold text-xs py-1.5 rounded mt-2">{form.ctaText}</div>}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-mono text-xs text-muted-foreground capitalize">{activeChannel} message</p>
                          <div className="bg-elevated/50 rounded-lg p-2">
                            <p className="font-mono text-xs text-white/80 leading-relaxed">{(form.whatsappBody || form.smsBody || form.igCaption || "Message preview...").replace(/\{\{firstName\}\}/g, "Priya").slice(0, 200)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Launch */}
          {step === 4 && (
            <div className="cyber-card p-6 space-y-5">
              <h2 className="font-display text-lg text-cyan tracking-widest mb-2">STEP 4: LAUNCH CHECKLIST</h2>
              <div className="space-y-3">
                {[
                  { label: "Campaign Name", value: form.name, ok: !!form.name },
                  { label: "Goal", value: GOALS.find(g => g.value === form.goal)?.label ?? "—", ok: true },
                  { label: "Channels", value: form.channels.join(", ") || "None selected", ok: form.channels.length > 0 },
                  { label: "Target Segment", value: form.segmentId ? segments?.find(s => s.id === form.segmentId)?.name ?? "—" : "All Contacts", ok: true },
                  { label: "Message", value: form.messageBody || form.whatsappBody || form.smsBody || "No message", ok: !!(form.messageBody || form.whatsappBody || form.smsBody) },
                  { label: "Scheduled At", value: form.scheduledAt || "Immediate", ok: true },
                ].map(item => (
                  <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg border ${item.ok ? "border-green/20 bg-green/5" : "border-pink/20 bg-pink/5"}`}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${item.ok ? "border-green bg-green/20 text-green" : "border-pink bg-pink/20 text-pink"}`}>
                      {item.ok ? <Check className="w-3 h-3" /> : "!"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground">{item.label}: </span>
                      <span className="font-mono text-xs text-white truncate">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-3 pt-4">
                <button
                  onClick={() => handleLaunch(false)}
                  disabled={createMutation.isPending}
                  className="cyber-button-primary w-full py-4 text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,245,255,0.3)]"
                >
                  <Rocket className="w-5 h-5" />
                  {createMutation.isPending ? "LAUNCHING..." : "🚀 LAUNCH CAMPAIGN"}
                </button>
                <button onClick={() => handleLaunch(true)} className="font-mono text-sm text-muted-foreground hover:text-white underline transition-colors flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Save as Draft
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="cyber-button-secondary px-4 py-2 flex items-center gap-2 text-sm disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> BACK
            </button>
            {step < 4 && (
              <button
                onClick={() => setStep(s => Math.min(4, s + 1))}
                disabled={step === 2 && form.channels.length === 0}
                className="cyber-button-primary px-4 py-2 flex items-center gap-2 text-sm disabled:opacity-30"
              >
                NEXT <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
