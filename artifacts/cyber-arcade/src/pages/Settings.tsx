import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useState } from "react";
import { Settings as SettingsIcon, Key, Users, Bell, Eye, EyeOff, Save } from "lucide-react";

function MaskedInput({ label, placeholder, envKey }: { label: string; placeholder: string; envKey: string }) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  return (
    <div className="space-y-1">
      <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={placeholder}
            className="w-full cyber-input px-3 py-2 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">Env var: <span className="text-cyan">{envKey}</span></p>
    </div>
  );
}

function ToggleSwitch({ label, desc }: { label: string; desc: string }) {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div>
        <p className="font-display text-sm text-white">{label}</p>
        <p className="font-mono text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-11 h-6 rounded-full transition-all duration-300 relative ${on ? "bg-cyan" : "bg-card border border-white/20"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300 ${on ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState<string | null>(null);

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="p-6 md:p-8 space-y-6 max-w-3xl">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-gradient tracking-widest mb-1 flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-cyan" /> SYSTEM SETTINGS
            </h1>
            <p className="font-mono text-sm text-muted-foreground">Configure mission parameters and integrations.</p>
          </div>

          {/* Channel Integrations */}
          <div className="cyber-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-cyan" />
              <h2 className="font-display text-lg text-cyan tracking-widest">CHANNEL INTEGRATIONS</h2>
            </div>

            <div className="pb-4 border-b border-white/5">
              <h3 className="font-display text-sm text-purple mb-3 tracking-wider">✉️ SendGrid (Email)</h3>
              <MaskedInput label="API Key" placeholder="SG.xxxxxxxxxxxx" envKey="SENDGRID_API_KEY" />
            </div>

            <div className="pb-4 border-b border-white/5">
              <h3 className="font-display text-sm text-green mb-3 tracking-wider">💬 Twilio (WhatsApp + SMS)</h3>
              <div className="space-y-3">
                <MaskedInput label="Account SID" placeholder="ACxxxxxxxxxxxxxxxx" envKey="TWILIO_ACCOUNT_SID" />
                <MaskedInput label="Auth Token" placeholder="xxxxxxxxxxxxxxxxxx" envKey="TWILIO_AUTH_TOKEN" />
                <MaskedInput label="Phone Number" placeholder="+1234567890" envKey="TWILIO_PHONE_NUMBER" />
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm text-yellow mb-3 tracking-wider">📸 Meta (Instagram / Facebook)</h3>
              <div className="p-3 bg-yellow/5 border border-yellow/20 rounded-lg">
                <p className="font-mono text-xs text-yellow">Meta API integration is Phase 2. Currently, creatives are stored in the database and copy-ready text is displayed for manual posting.</p>
              </div>
            </div>

            <button
              onClick={() => handleSave("integrations")}
              className="cyber-button-primary px-4 py-2 flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {saved === "integrations" ? "✓ SAVED" : "SAVE INTEGRATIONS"}
            </button>
          </div>

          {/* Team Members */}
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple" />
                <h2 className="font-display text-lg text-purple tracking-widest">TEAM OPERATIVES</h2>
              </div>
              <button className="cyber-button-secondary px-3 py-1.5 text-xs">+ ADD MEMBER</button>
            </div>
            <div className="space-y-3">
              {[
                { name: "Admin Unit", email: "admin@cyberarcade.in", role: "Super Admin" },
                { name: "Priya Ops", email: "priya@cyberarcade.in", role: "Campaign Manager" },
                { name: "Ravi CRM", email: "ravi@cyberarcade.in", role: "Sales Rep" },
              ].map(member => (
                <div key={member.email} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center font-display font-bold text-xs text-black">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-white">{member.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="cyber-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-yellow" />
              <h2 className="font-display text-lg text-yellow tracking-widest">ALERT PREFERENCES</h2>
            </div>
            <div className="space-y-1">
              <ToggleSwitch label="Email Notifications" desc="Receive campaign reports via email" />
              <ToggleSwitch label="WhatsApp Alerts" desc="Get instant notifications on WhatsApp" />
              <ToggleSwitch label="SMS Alerts" desc="Critical alerts via SMS" />
              <ToggleSwitch label="Conversion Alerts" desc="Alert when a contact enrolls" />
              <ToggleSwitch label="Weekly Report" desc="Auto-generated Sunday performance report" />
            </div>
            <button
              onClick={() => handleSave("notifications")}
              className="cyber-button-primary px-4 py-2 flex items-center gap-2 text-sm mt-4"
            >
              <Save className="w-4 h-4" />
              {saved === "notifications" ? "✓ SAVED" : "SAVE PREFERENCES"}
            </button>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
