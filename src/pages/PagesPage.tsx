import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flag, CheckCircle2, Check, ArrowRight, Sparkles } from 'lucide-react';

export const PagesPage: React.FC = () => {
  const { pages, toggleFollowPage } = useApp();
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const filteredPages = filter === 'following' ? pages.filter((p) => p.isFollowing) : pages;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-indigo-500" />
            <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
              Featured Pages & Publications
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Follow official engineering blogs, research labs, and company pages.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            All Pages
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'following'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Following ({pages.filter((p) => p.isFollowing).length})
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredPages.map((pg) => (
          <div
            key={pg.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={pg.logo}
                  alt={pg.name}
                  className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[var(--border)] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-bold text-[var(--text)] truncate">{pg.name}</h3>
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  </div>
                  <span className="text-[11px] text-[var(--muted)]">{pg.category}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {pg.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between">
              <span className="text-xs text-[var(--muted)] tabular-nums">
                {(pg.followersCount / 1000).toFixed(1)}k followers
              </span>

              <button
                onClick={() => toggleFollowPage(pg.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  pg.isFollowing
                    ? 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                    : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-xs'
                }`}
              >
                {pg.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
