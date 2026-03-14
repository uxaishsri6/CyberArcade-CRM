import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useGetContacts } from "@workspace/api-client-react";
import { Search, Plus, Download, Filter, ChevronLeft, ChevronRight, Eye, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Simplified query for UI demo
  const { data, isLoading } = useGetContacts({ search, page: page.toString(), limit: '25' });

  return (
    <AppLayout>
      <PageTransition className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full flex flex-col h-[calc(100vh-64px)] md:h-screen">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-gradient tracking-widest mb-1">CONTACT INTELLIGENCE</h1>
            <p className="text-muted-foreground font-mono text-sm">Manage and analyze prospective operatives.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search operatives..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="cyber-input w-full pl-9 pr-4 py-2 text-sm"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`cyber-button-secondary p-2 ${showFilters ? 'bg-primary/20 border-primary' : ''}`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button className="cyber-button-secondary p-2 text-muted-foreground hover:text-white">
              <Download className="w-5 h-5" />
            </button>
            <button className="cyber-button-primary px-4 py-2 flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> ADD CONTACT
            </button>
          </div>
        </header>

        {/* Filters Panel (Collapsible) */}
        {showFilters && (
          <div className="cyber-card p-4 shrink-0 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyan mb-1">STATUS</label>
                <select className="cyber-input w-full py-1.5 px-2 text-sm">
                  <option value="">All Statuses</option>
                  <option value="cold_lead">Cold Lead</option>
                  <option value="interested">Interested</option>
                  <option value="enrolled">Enrolled</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-cyan mb-1">SOURCE</label>
                <select className="cyber-input w-full py-1.5 px-2 text-sm">
                  <option value="">All Sources</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-cyan mb-1">TRIAL ATTENDED</label>
                <select className="cyber-input w-full py-1.5 px-2 text-sm">
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-cyan mb-1">MIN LEAD SCORE</label>
                <input type="range" className="w-full accent-cyan" />
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="cyber-card flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 bg-elevated/50 font-mono text-xs text-cyan tracking-wider">
                  <th className="p-4 w-10"><input type="checkbox" className="accent-cyan bg-background border-white/20 rounded" /></th>
                  <th className="p-4">OPERATIVE NAME</th>
                  <th className="p-4">CHILD INFO</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">SOURCE</th>
                  <th className="p-4 text-center">TRIAL</th>
                  <th className="p-4 w-32">LEAD SCORE</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="w-4 h-4 bg-elevated rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-32 bg-elevated rounded"></div></td>
                      <td className="p-4"><div className="h-4 w-24 bg-elevated rounded"></div></td>
                      <td className="p-4"><div className="h-6 w-20 bg-elevated rounded-full"></div></td>
                      <td className="p-4"><div className="h-6 w-20 bg-elevated rounded-full"></div></td>
                      <td className="p-4 text-center"><div className="h-4 w-4 bg-elevated rounded mx-auto"></div></td>
                      <td className="p-4"><div className="h-2 w-full bg-elevated rounded-full"></div></td>
                      <td className="p-4"><div className="h-8 w-16 bg-elevated rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : data?.contacts?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-muted-foreground font-mono">
                      <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      No operatives found matching criteria.
                    </td>
                  </tr>
                ) : (
                  data?.contacts.map((contact) => (
                    <tr key={contact.id} className="table-row-hover group">
                      <td className="p-4"><input type="checkbox" className="accent-cyan bg-background border-white/20 rounded" /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-elevated border border-white/10 flex items-center justify-center font-display font-bold text-xs text-white group-hover:border-cyan group-hover:text-cyan transition-colors">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-cyan transition-colors">{contact.firstName} {contact.lastName}</p>
                            <p className="text-xs font-mono text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {contact.childName ? (
                          <div>
                            <p className="text-sm text-white">{contact.childName}</p>
                            <p className="text-xs font-mono text-muted-foreground">{contact.childAge} yrs • {contact.childGrade}</p>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={contact.status} />
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-white/70 border border-white/10 uppercase tracking-wider">
                          {contact.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {contact.trialAttended ? (
                          <span className="text-green font-bold text-lg drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]">✓</span>
                        ) : (
                          <span className="text-white/20 font-mono text-xs">--</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan to-purple" 
                              style={{ width: `${contact.leadScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-cyan w-6 text-right">{contact.leadScore}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/contacts/${contact.id}`} className="p-1.5 text-muted-foreground hover:text-cyan hover:bg-cyan/10 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button className="p-1.5 text-muted-foreground hover:text-yellow hover:bg-yellow/10 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-muted-foreground hover:text-pink hover:bg-pink/10 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between font-mono text-sm shrink-0 bg-card">
            <span className="text-muted-foreground">
              Showing {(page - 1) * 25 + 1} to {Math.min(page * 25, data?.total || 0)} of {data?.total || 0} entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-elevated disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-cyan px-2">PAGE {page}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page === (data?.totalPages || 1)}
                className="p-1 rounded hover:bg-elevated disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </PageTransition>
    </AppLayout>
  );
}
