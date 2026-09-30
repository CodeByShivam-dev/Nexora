import React from 'react';
import { useApp } from '../context/AppContext';
import { TRENDING_TOPICS } from '../services/mockData';
import { TrendingUp, UserPlus, Users, Activity, Check } from 'lucide-react';

export const RightSidebar: React.FC = () => {
  const { friends, toggleFollow, groups, toggleJoinGroup, navigate } = useApp();

  const suggestedUsers = friends.slice(0, 3);
  const popularGroups = groups.slice(0, 2);

  return (
    <aside className="sticky top-20 hidden w-80 shrink-0 space-y-4 xl:block">
      {/* Suggested People */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text)]">
            <UserPlus className="h-4 w-4 text-[var(--primary)]" />
            <span>Suggested People</span>
          </div>
          <button
            onClick={() => navigate('friends')}
            className="text-xs font-medium text-[var(--primary)] hover:underline"
          >
            See all
          </button>
        </div>

        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-[var(--text)] hover:underline cursor-pointer" onClick={() => navigate('profile')}>
                    {user.name}
                  </div>
                  <div className="truncate text-[11px] text-[var(--muted)]">
                    {user.headline || `@${user.username}`}
                  </div>
                  {user.mutualFriends && (
                    <div className="text-[10px] text-[var(--muted)]">
                      {user.mutualFriends} mutual connections
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleFollow(user.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all shrink-0 ${
                  user.isFollowing
                    ? 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                    : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-xs'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text)]">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <span>Trending Topics</span>
          </div>
          <button
            onClick={() => navigate('explore')}
            className="text-xs font-medium text-[var(--primary)] hover:underline"
          >
            Explore
          </button>
        </div>

        <div className="space-y-2.5">
          {TRENDING_TOPICS.map((topic, idx) => (
            <button
              key={topic.id}
              onClick={() => {
                navigate('explore');
              }}
              className="flex w-full items-start justify-between text-left group p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <div>
                <span className="text-[11px] text-[var(--muted)]">
                  {topic.category} · Trending
                </span>
                <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  #{topic.hashtag}
                </div>
              </div>
              <span className="text-[11px] text-[var(--muted)] tabular-nums">
                {topic.postsCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Groups */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text)]">
            <Users className="h-4 w-4 text-[var(--secondary)]" />
            <span>Popular Communities</span>
          </div>
          <button
            onClick={() => navigate('groups')}
            className="text-xs font-medium text-[var(--primary)] hover:underline"
          >
            All
          </button>
        </div>

        <div className="space-y-3">
          {popularGroups.map((group) => (
            <div key={group.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={group.avatar}
                  alt={group.name}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-[var(--border)] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-[var(--text)]">
                    {group.name}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] tabular-nums">
                    {(group.membersCount / 1000).toFixed(1)}k members
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleJoinGroup(group.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all shrink-0 ${
                  group.isJoined
                    ? 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                    : 'border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-light)]'
                }`}
              >
                {group.isJoined ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Joined
                  </span>
                ) : (
                  'Join'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="px-2 text-[11px] text-[var(--muted)] leading-relaxed space-x-2">
        <button onClick={() => navigate('about')} className="hover:underline">About</button>
        <span>·</span>
        <button onClick={() => navigate('help')} className="hover:underline">Help</button>
        <span>·</span>
        <button onClick={() => navigate('settings')} className="hover:underline">Privacy & Terms</button>
        <span>·</span>
        <span>© 2026 NEXORA</span>
      </div>
    </aside>
  );
};
