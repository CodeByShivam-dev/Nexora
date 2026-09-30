import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import {
  Layers,
  Users,
  Lock,
  Globe,
  Plus,
  Check,
  Search,
  MessageSquare,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const { groups, toggleJoinGroup, posts, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--secondary)]" />
            <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
              Technical Communities & Groups
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Engage with dedicated practitioner guilds, share architecture, and learn.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'my'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            My Communities ({groups.filter((g) => g.isJoined).length})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'discover'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Discover More
          </button>
        </div>
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeTab === 'my' ? groups.filter((g) => g.isJoined) : groups).map((grp) => (
          <div
            key={grp.id}
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-28 w-full bg-slate-800">
                <img src={grp.coverImage} alt={grp.name} className="h-full w-full object-cover" />
                <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-semibold">
                  {grp.privacy}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <img
                    src={grp.avatar}
                    alt={grp.name}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-[var(--surface)] -mt-7 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[var(--text)] truncate">{grp.name}</h3>
                    <div className="text-[11px] text-[var(--muted)]">
                      {grp.category} · {(grp.membersCount / 1000).toFixed(1)}k members
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                  {grp.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-[var(--border)] mt-2 flex items-center justify-between">
              <button
                onClick={() => setSelectedGroupId(grp.id)}
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                View Community
              </button>

              <button
                onClick={() => toggleJoinGroup(grp.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  grp.isJoined
                    ? 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                    : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-xs'
                }`}
              >
                {grp.isJoined ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Joined
                  </span>
                ) : (
                  'Join Group'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Group Details Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-h-[90vh] overflow-y-auto w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                {selectedGroup.category} Guild
              </span>
              <button
                onClick={() => setSelectedGroupId(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <img src={selectedGroup.coverImage} alt={selectedGroup.name} className="h-44 w-full object-cover" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{selectedGroup.name}</h2>
                <div className="text-xs text-[var(--muted)]">
                  {selectedGroup.privacy} Group · {selectedGroup.membersCount.toLocaleString()} members
                </div>
              </div>
              <button
                onClick={() => toggleJoinGroup(selectedGroup.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                  selectedGroup.isJoined ? 'border border-[var(--border)] text-[var(--text)]' : 'bg-[var(--primary)] text-white'
                }`}
              >
                {selectedGroup.isJoined ? 'Member' : 'Join'}
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {selectedGroup.description}
            </p>

            <div className="border-t border-[var(--border)] pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Recent Guild Discussions
              </h4>
              {posts.slice(0, 1).map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
