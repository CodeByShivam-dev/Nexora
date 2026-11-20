import { Clock, Hash, Search as SearchIcon, Trash2, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { AppShell } from '../../components/layout/AppShell';
import { PostCard } from '../../components/posts/PostCard';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { useNexora } from '../../context/NexoraContext';
import { Post } from '../../types';
import { formatCompactNumber } from '../../utils/formatters';

type SearchTab = 'all' | 'people' | 'posts' | 'hashtags' | 'communities';

const SUGGESTIONS = ['#DesignSystems', '#TypeScript', '#Photography', 'maya.lin', 'React Developers'];

export function SearchPage() {
  const {
    users,
    posts,
    communities,
    currentUser,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    toggleFollow,
    toggleJoinCommunity,
  } = useNexora();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const paramQ = searchParams.get('q') || '';
    setQuery(paramQ);
  }, [searchParams]);

  const cleanQ = query.trim().toLowerCase();
  const cleanTagQ = cleanQ.replace(/^#/, '');

  const matchedUsers = useMemo(() => {
    if (!cleanQ) return [];
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(cleanQ) ||
        u.username.toLowerCase().includes(cleanQ) ||
        u.bio.toLowerCase().includes(cleanQ)
    );
  }, [users, cleanQ]);

  const matchedPosts = useMemo(() => {
    if (!cleanQ) return [];
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(cleanQ) ||
        p.hashtags.some((t) => t.toLowerCase().includes(cleanTagQ)) ||
        p.category.toLowerCase().includes(cleanQ)
    );
  }, [posts, cleanQ, cleanTagQ]);

  const matchedHashtags = useMemo(() => {
    if (!cleanQ) return [];
    const counts = new Map<string, number>();
    posts.forEach((p) => {
      p.hashtags.forEach((tag) => {
        if (tag.toLowerCase().includes(cleanTagQ)) {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts, cleanQ, cleanTagQ]);

  const matchedCommunities = useMemo(() => {
    if (!cleanQ) return [];
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(cleanQ) ||
        c.description.toLowerCase().includes(cleanQ) ||
        c.category.toLowerCase().includes(cleanQ)
    );
  }, [communities, cleanQ]);

  const totalResults =
    matchedUsers.length +
    matchedPosts.length +
    matchedHashtags.length +
    matchedCommunities.length;

  const applySearch = (term: string) => {
    setQuery(term);
    setSearchParams(term.trim() ? { q: term.trim() } : {});
    if (term.trim()) {
      addRecentSearch(term.trim());
    }
  };

  return (
    <AppShell pageTitle="Search">
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            Search
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
            Find creators, posts, #hashtags, and communities across local demo data.
          </p>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applySearch(query);
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) setSearchParams({});
              }}
              placeholder="Search people, captions, #hashtags, or communities..."
              className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
            />
            {query && (
              <button
                type="button"
                onClick={() => applySearch('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Suggestions & Recent Searches when idle */}
        {!cleanQ ? (
          <div className="space-y-5">
            {recentSearches.length > 0 && (
              <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#06B6D4]" />
                    Recent Searches
                  </h2>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs font-medium text-slate-500 hover:text-[#EF4444] inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear history
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-[#252D3A]">
                  {recentSearches.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between py-2.5 gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => applySearch(item)}
                        className="text-sm text-slate-800 dark:text-[#F8FAFC] hover:text-[#06B6D4] text-left truncate flex-1"
                      >
                        {item}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecentSearch(item)}
                        aria-label={`Remove ${item}`}
                        className="p-1 text-slate-400 hover:text-[#EF4444]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 sm:p-5 space-y-3">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Suggested Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => applySearch(term)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] text-xs font-medium text-slate-700 dark:text-[#94A3B8] hover:border-[#8B5CF6] hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all' as SearchTab, label: `All (${totalResults})` },
                { id: 'people' as SearchTab, label: `People (${matchedUsers.length})` },
                { id: 'posts' as SearchTab, label: `Posts (${matchedPosts.length})` },
                { id: 'hashtags' as SearchTab, label: `Hashtags (${matchedHashtags.length})` },
                {
                  id: 'communities' as SearchTab,
                  label: `Communities (${matchedCommunities.length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                      : 'border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] text-slate-600 dark:text-[#94A3B8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {totalResults === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title={`No matches for "${query}"`}
                description="Check spelling or try searching for #DesignSystems, React, or maya.lin."
                actionLabel="Clear Search"
                onAction={() => applySearch('')}
              />
            ) : (
              <div className="space-y-6">
                {/* People Results */}
                {(activeTab === 'all' || activeTab === 'people') &&
                  matchedUsers.length > 0 && (
                    <section className="space-y-3">
                      <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        People
                      </h2>
                      <div className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] divide-y divide-slate-100 dark:divide-[#252D3A]">
                        {matchedUsers.map((person) => {
                          const isMe = currentUser?.id === person.id;
                          const isFollowing =
                            currentUser?.following.includes(person.id) ?? false;
                          return (
                            <div
                              key={person.id}
                              className="p-4 flex items-center justify-between gap-3"
                            >
                              <button
                                type="button"
                                onClick={() => navigate(`/profile/${person.username}`)}
                                className="flex items-center gap-3 min-w-0 text-left"
                              >
                                <Avatar
                                  src={person.avatar}
                                  name={person.fullName}
                                  size="md"
                                  verified={person.verified}
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                                    {person.fullName}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
                                    @{person.username} · {person.bio}
                                  </p>
                                </div>
                              </button>
                              {!isMe && currentUser && (
                                <button
                                  type="button"
                                  onClick={() => toggleFollow(person.id)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 ${
                                    isFollowing
                                      ? 'border border-slate-200 dark:border-[#252D3A] text-slate-600 dark:text-[#94A3B8]'
                                      : 'bg-[#8B5CF6] text-white'
                                  }`}
                                >
                                  {isFollowing ? 'Following' : 'Follow'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                {/* Hashtag Results */}
                {(activeTab === 'all' || activeTab === 'hashtags') &&
                  matchedHashtags.length > 0 && (
                    <section className="space-y-3">
                      <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        Hashtags
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {matchedHashtags.map(([tag, count]) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => applySearch(`#${tag}`)}
                            className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] flex items-center justify-between hover:border-[#06B6D4] transition-colors text-left"
                          >
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#06B6D4]">
                              <Hash className="w-4 h-4" />
                              {tag}
                            </span>
                            <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#64748B]">
                              {count} {count === 1 ? 'post' : 'posts'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Communities Results */}
                {(activeTab === 'all' || activeTab === 'communities') &&
                  matchedCommunities.length > 0 && (
                    <section className="space-y-3">
                      <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        Communities
                      </h2>
                      <div className="space-y-3">
                        {matchedCommunities.map((comm) => {
                          const isMember = currentUser
                            ? comm.memberIds.includes(currentUser.id)
                            : false;
                          return (
                            <div
                              key={comm.id}
                              className="p-4 rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] flex items-center justify-between gap-3"
                            >
                              <button
                                type="button"
                                onClick={() => navigate(`/communities/${comm.id}`)}
                                className="flex items-center gap-3 min-w-0 text-left"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center shrink-0">
                                  <Users className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                                    {comm.name}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
                                    {comm.category} ·{' '}
                                    {formatCompactNumber(comm.memberIds.length)} members
                                  </p>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleJoinCommunity(comm.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 ${
                                  isMember
                                    ? 'border border-slate-200 dark:border-[#252D3A] text-slate-600 dark:text-[#94A3B8]'
                                    : 'bg-[#06B6D4] text-[#090B10]'
                                }`}
                              >
                                {isMember ? 'Joined' : 'Join'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                {/* Posts Results */}
                {(activeTab === 'all' || activeTab === 'posts') &&
                  matchedPosts.length > 0 && (
                    <section className="space-y-3">
                      <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        Posts
                      </h2>
                      <div className="space-y-4">
                        {matchedPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            onOpenDetail={(p) => setSelectedPost(p)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
              </div>
            )}
          </div>
        )}
      </div>

      <PostDetailModal
        post={
          selectedPost ? posts.find((p) => p.id === selectedPost.id) ?? selectedPost : null
        }
        onClose={() => setSelectedPost(null)}
      />
    </AppShell>
  );
}
