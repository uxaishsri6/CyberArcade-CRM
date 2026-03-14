import { Bot, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { PageTransition } from "@/components/PageTransition";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      
      <PageTransition className="w-full max-w-md p-8 relative z-10">
        <div className="cyber-card p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-elevated border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,245,255,0.2)]">
            <Bot className="w-12 h-12 text-cyan" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-widest text-shadow-glow">CYBERARCADE</h1>
          <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm mb-8">Mission Control Access</p>
          
          <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="text-left">
              <label className="block font-mono text-xs text-cyan mb-1 ml-1">OPERATIVE ID</label>
              <input 
                type="text" 
                defaultValue="admin@cyberarcade.dev"
                className="w-full cyber-input px-4 py-3 bg-background"
              />
            </div>
            
            <div className="text-left mb-6">
              <label className="block font-mono text-xs text-cyan mb-1 ml-1">PASSCODE</label>
              <input 
                type="password" 
                defaultValue="********"
                className="w-full cyber-input px-4 py-3 bg-background"
              />
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-pink/10 border border-pink/20 rounded text-left mb-6">
              <ShieldAlert className="w-5 h-5 text-pink shrink-0" />
              <p className="text-xs font-mono text-pink/90">Restricted system. Unauthorized access will be logged and reported.</p>
            </div>
            
            <Link 
              href="/dashboard"
              className="w-full block text-center cyber-button-primary py-4 text-lg shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            >
              INITIALIZE ACCESS
            </Link>
          </form>
        </div>
      </PageTransition>
    </div>
  );
}
