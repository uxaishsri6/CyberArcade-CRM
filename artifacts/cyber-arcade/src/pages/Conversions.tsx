import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useGetConversionFunnel, useGetConversionCohorts } from "@workspace/api-client-react";

export default function Conversions() {
  const { data: funnel } = useGetConversionFunnel();
  const { data: cohorts } = useGetConversionCohorts();

  return (
    <AppLayout>
      <PageTransition className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto w-full">
        <header>
          <h1 className="text-2xl md:text-3xl font-display text-gradient tracking-widest mb-1">CONVERSION INTELLIGENCE</h1>
          <p className="text-muted-foreground font-mono text-sm">Analyze lead progression through the academy pipeline.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Funnel Visualizer */}
          <div className="lg:col-span-2 cyber-card p-6 md:p-8">
            <h2 className="font-display text-lg text-cyan mb-8 tracking-widest">PIPELINE STAGES</h2>
            
            <div className="space-y-6">
              {funnel?.map((stage, idx) => {
                // Calculate width based on percent, ensuring min width for visibility
                const width = Math.max(stage.percent, 2);
                const isLast = idx === funnel.length - 1;
                
                return (
                  <div key={stage.stage} className="relative group cursor-pointer">
                    <div className="flex justify-between items-end mb-1 relative z-10">
                      <span className="font-mono text-sm uppercase tracking-wider text-white flex items-center gap-2">
                        {isLast && <span className="text-green text-lg drop-shadow-[0_0_5px_rgba(0,255,136,0.8)]">★</span>}
                        {stage.stage}
                      </span>
                      <div className="text-right">
                        <span className="font-display font-bold text-lg text-white mr-3">{stage.count}</span>
                        <span className="font-mono text-xs text-cyan">{stage.percent.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {/* The Bar */}
                    <div className="h-8 bg-elevated rounded overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan to-purple opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out relative"
                        style={{ width: `${width}%` }}
                      >
                        {/* Glow effect on the edge */}
                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-sm mix-blend-overlay" />
                      </div>
                    </div>
                    
                    {/* Dropoff Indicator */}
                    {!isLast && stage.dropOffPercent > 0 && (
                      <div className="absolute right-0 -bottom-5 text-[10px] font-mono text-pink tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Drop-off: {stage.dropOffPercent.toFixed(1)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Panel Stats */}
          <div className="space-y-6">
            <div className="cyber-card p-6 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center relative overflow-hidden group">
              {/* <!-- tech abstract background --> */}
              <div className="absolute inset-0 bg-card/90 backdrop-blur-sm group-hover:bg-card/80 transition-all" />
              <div className="relative z-10 text-center py-8">
                <p className="font-mono text-xs text-cyan uppercase tracking-widest mb-2">Overall Conversion Rate</p>
                <h3 className="font-display font-bold text-6xl text-white text-shadow-glow">12.4<span className="text-2xl text-muted-foreground">%</span></h3>
                <p className="font-mono text-xs text-green mt-4 flex items-center justify-center gap-1">
                  ▲ +1.2% from last month
                </p>
              </div>
            </div>

            <div className="cyber-card p-6">
               <h2 className="font-display text-sm text-cyan mb-4 tracking-widest uppercase">Avg Time to Convert</h2>
               <div className="flex items-end gap-2">
                 <span className="font-display font-bold text-4xl text-purple">14</span>
                 <span className="font-mono text-muted-foreground pb-1 uppercase tracking-widest">Days</span>
               </div>
               <div className="w-full h-1 bg-elevated mt-4 rounded-full overflow-hidden">
                 <div className="w-1/3 h-full bg-purple" />
               </div>
               <p className="text-xs font-mono text-muted-foreground mt-2">Target: &lt; 10 days</p>
            </div>
          </div>
        </div>

        {/* Cohort Table */}
        <div className="cyber-card overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="font-display text-lg text-cyan tracking-widest">MONTHLY COHORTS</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-elevated/50 text-cyan">
                  <th className="p-4 border-b border-white/10">COHORT MONTH</th>
                  <th className="p-4 border-b border-white/10 text-right">NEW LEADS</th>
                  <th className="p-4 border-b border-white/10 text-right">TRIAL RATE</th>
                  <th className="p-4 border-b border-white/10 text-right">ATTENDANCE RATE</th>
                  <th className="p-4 border-b border-white/10 text-right">CONVERSION RATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cohorts?.map((row) => (
                  <tr key={row.month} className="table-row-hover">
                    <td className="p-4 text-white font-bold">{row.month}</td>
                    <td className="p-4 text-right">{row.newLeads}</td>
                    <td className="p-4 text-right text-purple">{row.trialRate.toFixed(1)}%</td>
                    <td className="p-4 text-right text-cyan">{row.attendanceRate.toFixed(1)}%</td>
                    <td className="p-4 text-right text-green drop-shadow-[0_0_2px_rgba(0,255,136,0.5)] font-bold">{row.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
                {!cohorts && [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-elevated rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-elevated rounded w-16 ml-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-elevated rounded w-16 ml-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-elevated rounded w-16 ml-auto"></div></td>
                    <td className="p-4"><div className="h-4 bg-elevated rounded w-16 ml-auto"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </PageTransition>
    </AppLayout>
  );
}
