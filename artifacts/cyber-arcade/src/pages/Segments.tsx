import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useGetSegments } from "@workspace/api-client-react";
import { Target, Plus, Users, Settings2, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Segments() {
  const { data: segments, isLoading } = useGetSegments();

  return (
    <AppLayout>
      <PageTransition className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-gradient tracking-widest mb-1">SEGMENT LIBRARY</h1>
            <p className="text-muted-foreground font-mono text-sm">Smart audience groupings for targeted transmissions.</p>
          </div>
          <button className="cyber-button-primary px-5 py-2.5 flex items-center gap-2">
            <Plus className="w-5 h-5" /> CREATE SEGMENT
          </button>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 cyber-card animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments?.map((segment) => (
              <div key={segment.id} className="cyber-card p-0 flex flex-col relative overflow-hidden group">
                {/* Colored accent line */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity" 
                  style={{ backgroundColor: segment.color, boxShadow: `0 0 10px ${segment.color}` }} 
                />
                
                <div className="p-6 pl-8 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display font-bold text-xl text-white group-hover:text-cyan transition-colors">{segment.name}</h3>
                    <div className="p-2 rounded bg-elevated border border-white/5 text-cyan">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{segment.description}</p>
                  
                  <div className="flex items-end gap-3 mb-2">
                    <span className="font-display font-bold text-4xl text-white" style={{ color: segment.color, textShadow: `0 0 10px ${segment.color}40` }}>
                      {segment.contactCount}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Contacts Matched
                    </span>
                  </div>
                </div>

                <div className="p-3 border-t border-white/5 bg-elevated/30 flex justify-between items-center pl-8">
                  <div className="text-xs font-mono text-muted-foreground truncate max-w-[150px]">
                    {Object.keys(segment.filters || {}).length} active filters
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-muted-foreground hover:text-cyan hover:bg-cyan/10 rounded transition-colors" title="Edit Segment">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-muted-foreground hover:text-pink hover:bg-pink/10 rounded transition-colors" title="Delete Segment">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    </AppLayout>
  );
}
