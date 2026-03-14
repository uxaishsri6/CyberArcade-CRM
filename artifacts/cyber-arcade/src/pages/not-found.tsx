import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <PageTransition className="cyber-card p-12 max-w-lg w-full text-center border-pink/30 relative overflow-hidden">
        {/* Error scanlines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,rgba(255,45,120,0.1)_3px,rgba(255,45,120,0.1)_4px)] pointer-events-none" />
        
        <div className="relative z-10">
          <AlertTriangle className="w-24 h-24 text-pink mx-auto mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(255,45,120,0.8)]" />
          <h1 className="font-display font-bold text-4xl text-white mb-2 tracking-widest text-shadow-glow">404 ERROR</h1>
          <p className="font-mono text-pink uppercase tracking-widest mb-8">Mission failed. Coordinates not found in database.</p>
          
          <div className="p-4 bg-elevated border border-white/10 rounded font-mono text-sm text-left text-muted-foreground mb-8">
            <p className="text-cyan mb-1">&gt; Analyzing trajectory...</p>
            <p>&gt; Target sector is empty or restricted.</p>
            <p className="text-green mt-2">&gt; Suggesting recalibration to primary dashboard.</p>
          </div>

          <Link href="/dashboard" className="cyber-button-primary px-8 py-3 inline-block">
            RECALIBRATE TO DASHBOARD
          </Link>
        </div>
      </PageTransition>
    </div>
  );
}
