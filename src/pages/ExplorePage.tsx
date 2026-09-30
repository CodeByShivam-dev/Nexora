import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import { TRENDING_TOPICS } from '../services/mockData';
import {
  Search,
  Compass,
  TrendingUp,
  Users,
  Layers,
  Flag,
  Check,
  CheckCircle2,
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { posts, friends, toggleFollow, groups, toggleJoinGroup, pages, toggleFollowPage, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'posts' | 'groups' | 'pages'>('all');
  const [exploreSearch, setExploreSearch] = useState('');

  const filteredTrending = TRENDING_TOPICS.filter((t) =>
    t.hashtag.toLowerCase().includes(exploreSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)]">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">Explore & Discover</h1>
            <p className="text-xs text-[var(--muted)]">Trending technical discussions, guilds, and creators</p>
          </div>
        </div>

        {/* Search input in explore */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search topics, people, hashtags, or groups..."
            value={exploreSearch}
            onChange={(e) => setExploreSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
          />
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(['all', 'people', 'posts', 'groups', 'pages'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--surface-secondary)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Topics Grid (if tab is all or posts) */}
      {(activeTab === 'all' || activeTab === 'posts') && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 font-bold text-sm text-[var(--text)]">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <span>Trending Hashtags</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredTrending.map((topic) => (
              <div
                key={topic.id}
                onClick={() => navigate('search')}
                className="group p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] transition-all cursor-pointer"
              >
                <span className="text-[11px] text-[var(--muted)] font-medium">
                  {topic.category}
                </span>
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors mt-0.5">
                  #{topic.hashtag}
                </div>
                <span className="text-[11px] text-[var(--muted)] tabular-nums mt-1 block">
                  {topic.postsCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested People Grid (if tab is all or people) */}
      {(activeTab === 'all' || activeTab === 'people') && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--text)]">
              <Users className="h-4 w-4 text-[var(--primary)]" />
              <span>Suggested People in Tech</span>
            </div>
            <button
              onClick={() => navigate('friends')}
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="truncate text-xs font-bold text-[var(--text)]">
                        {user.name}
                      </span>
                      {user.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />}
                    </div>
                    <div className="truncate text-[11px] text-[var(--muted)]">
                      {user.headline}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      {user.distanceKm ? `~${user.distanceKm} km away · ` : ''}{user.mutualFriends || 8} mutual friends
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
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
      )}

      {/* Popular Groups Grid (if tab is all or groups) */}
      {(activeTab === 'all' || activeTab === 'groups') && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--text)]">
              <Layers className="h-4 w-4 text-[var(--secondary)]" />
              <span>Recommended Communities</span>
            </div>
            <button
              onClick={() => navigate('groups')}
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              See All Groups
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((grp) => (
              <div
                key={grp.id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-xs transition-all"
              >
                <img
                  src={grp.coverImage}
                  alt={grp.name}
                  className="h-20 w-full object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--primary)]">
                      {grp.category} · {grp.privacy}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] tabular-nums">
                      {(grp.membersCount / 1000).toFixed(1)}k members
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text)]">{grp.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{grp.description}</p>
                  
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => toggleJoinGroup(grp.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        grp.isJoined
                          ? 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                          : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-xs'
                      }`}
                    >
                      {grp.isJoined ? 'Joined' : 'Join Community'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Posts */}
      {(activeTab === 'all' || activeTab === 'posts') && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
            Trending Discussions
          </h3>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
