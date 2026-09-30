import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import api from '../services/api';
import {
  Search,
  X,
  Clock,
  Users,
  Layers,
  Flag,
  FileText,
  Hash,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    posts,
    currentUser,
    toggleFollow,
    groups,
    toggleJoinGroup,
    pages,
    toggleFollowPage,
    navigate,
    showToast,
    openDirectConversation,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'posts' | 'groups' | 'pages'>('all');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Real User Search
  useEffect(() => {
    let isCancelled = false;
    const fetchDbUsers = async () => {
      setIsSearchingDb(true);
      try {
        const res = await api.searchUsers(debouncedQuery, 0, 20);
        if (!isCancelled && res.status === 200 && res.data) {
          setDbUsers(res.data);
        }
      } catch (err) {
        console.error('Database search error:', err);
      } finally {
        if (!isCancelled) setIsSearchingDb(false);
      }
    };

    fetchDbUsers();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const handleSearchCommit = (q: string) => {
    setSearchQuery(q);
    addSearchHistory(q);
  };

  const handleDirectMessage = async (user: any) => {
    try {
      await openDirectConversation({
        id: user.id,
        name: user.name || user.displayName || user.username,
        username: user.username,
        avatar: user.avatar,
      });
      navigate('messages');
    } catch (err: any) {
      showToast(err.message || `Unable to start conversation with ${user.name || user.username}`, 'error');
    }
  };

  // Filter items
  const matchedPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      p.hashtags?.some((h) => h.toLowerCase().includes(debouncedQuery.toLowerCase()))
  );

  const matchedGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const matchedPages = pages.filter(
    (p) =>
      p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const isDemoAccount = (username: string) => {
    return ['shivam_dev', 'priya_design', 'alexchen_arch'].includes(username);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchCommit(searchQuery);
            }}
            placeholder="Search people, posts, or keywords..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-3 pl-10 pr-10 text-sm text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Live Search Status */}
        {isSearchingDb && (
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] px-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary)]" />
            <span>Searching...</span>
          </div>
        )}

        {/* Recent Search History Chips */}
        {searchHistory.length > 0 && !debouncedQuery && (
          <div className="space-y-2 pt-1 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Recent Searches
              </span>
              <button
                onClick={clearSearchHistory}
                className="text-xs text-[var(--muted)] hover:text-rose-500 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchCommit(item)}
                  className="rounded-lg bg-[var(--surface-secondary)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border)]">
          {(['all', 'people', 'posts', 'groups', 'pages'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--surface-secondary)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {tab === 'people' ? `People (${dbUsers.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)] px-1">
        <span>
          Showing results for <strong className="text-[var(--text)]">"{debouncedQuery || 'all'}"</strong>
        </span>
        <span className="tabular-nums">
          {matchedPosts.length + dbUsers.length + matchedGroups.length + matchedPages.length} items found
        </span>
      </div>

      {/* People Results */}
      {(activeTab === 'all' || activeTab === 'people') && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-sm text-[var(--text)]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--primary)]" />
              <span>People ({dbUsers.length})</span>
            </div>
          </div>

          {dbUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dbUsers.map((user) => {
                const isMe = String(user.id) === String(currentUser.id);
                const isDemo = isDemoAccount(user.username);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-secondary)]/70 hover:bg-[var(--surface-secondary)] transition-colors border border-[var(--border)]/50"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => navigate('profile', { username: user.username })}
                    >
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={user.name || user.username}
                        className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="truncate text-xs font-bold text-[var(--text)] hover:underline">
                            {user.name || user.username}
                          </span>
                          {user.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />}
                          {isDemo ? (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Demo
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              User
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] font-mono">
                          @{user.username} · #{user.id}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center gap-2">
                          <span>{user.followersCount || 0} followers</span>
                          <span>·</span>
                          <span>{user.postsCount || 0} posts</span>
                        </div>
                      </div>
                    </div>

                    {!isMe && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleDirectMessage(user)}
                          title="Direct Message"
                          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            await toggleFollow(user.id);
                            // Refresh search list to sync counts
                            const updated = await api.searchUsers(debouncedQuery, 0, 20);
                            if (updated.status === 200 && updated.data) setDbUsers(updated.data);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            user.isFollowing
                              ? 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                              : 'bg-[var(--primary)] text-white hover:opacity-90'
                          }`}
                        >
                          {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
              {isSearchingDb ? 'Searching for users...' : `No users found matching "${debouncedQuery}".`}
            </div>
          )}
        </div>
      )}

      {/* Groups Results */}
      {(activeTab === 'all' || activeTab === 'groups') && matchedGroups.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text)]">
            <Layers className="h-4 w-4 text-[var(--secondary)]" />
            <span>Groups ({matchedGroups.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchedGroups.map((grp) => (
              <div
                key={grp.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-secondary)]/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={grp.avatar}
                    alt={grp.name}
                    className="h-9 w-9 rounded-lg object-cover ring-1 ring-[var(--border)] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-[var(--text)]">
                      {grp.name}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      {(grp.membersCount / 1000).toFixed(1)}k members
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleJoinGroup(grp.id)}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all shrink-0"
                >
                  {grp.isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Results */}
      {(activeTab === 'all' || activeTab === 'posts') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text)]">
            <FileText className="h-4 w-4 text-emerald-500" />
            <span>Posts ({matchedPosts.length})</span>
          </div>

          {matchedPosts.length > 0 ? (
            matchedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--muted)]">
              No matching posts found. Try different search terms or clear filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
