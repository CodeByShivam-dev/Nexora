import { ArrowLeft, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { MediaImage } from '../../components/common/MediaResolver';
import { AppShell } from '../../components/layout/AppShell';
import { CreatePostForm } from '../../components/posts/CreatePostModal';
import { PostCard } from '../../components/posts/PostCard';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { useNexora } from '../../context/NexoraContext';
import { Post, PostCategory } from '../../types';
import { formatCompactNumber } from '../../utils/formatters';

const CATEGORIES = ['All', ...Object.values(PostCategory)];

export function CommunitiesPage() {
  const { communityId } = useParams<{ communityId?: string }>();
  const {
    currentUser,
    users,
    communities,
    posts,
    toggleJoinCommunity,
  } = useNexora();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const selectedCommunity = useMemo(
    () => (communityId ? communities.find((c) => c.id === communityId) ?? null : null),
    [communities, communityId]
  );

  const filteredCommunities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return communities.filter((c) => {
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [communities, query, selectedCategory]);

  const communityPosts = useMemo(() => {
    if (!selectedCommunity) return [];
    return posts
      .filter((p) => p.communityId === selectedCommunity.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [posts, selectedCommunity]);

  // Community Detail View
  if (selectedCommunity) {
    const isMember = currentUser
      ? selectedCommunity.memberIds.includes(currentUser.id)
      : false;
    const members = users.filter((u) => selectedCommunity.memberIds.includes(u.id));

    return (
      <AppShell pageTitle={selectedCommunity.name}>
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => navigate('/communities')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="w-4 h-4" />
            All Communities
          </button>

          <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-hidden">
            <div className="h-36 sm:h-44 w-full bg-[#0E121A]">
              <MediaImage
                src={selectedCommunity.bannerImage}
                alt={selectedCommunity.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#06B6D4]">
                    {selectedCommunity.category}
                  </p>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
                    {selectedCommunity.name}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => toggleJoinCommunity(selectedCommunity.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isMember
                      ? 'border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#94A3B8] hover:border-[#EF4444] hover:text-[#EF4444]'
                      : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                  }`}
                >
                  {isMember ? 'Joined' : 'Join Community'}
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                {selectedCommunity.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#252D3A]">
                <div className="flex items-center -space-x-2">
                  {members.slice(0, 5).map((m) => (
                    <Avatar key={m.id} src={m.avatar} name={m.fullName} size="xs" />
                  ))}
                  <span className="pl-4 text-xs text-slate-500 dark:text-[#94A3B8] tabular-nums">
                    {formatCompactNumber(selectedCommunity.memberIds.length)} members
                  </span>
                </div>
                <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#64748B]">
                  {communityPosts.length} posts
                </span>
              </div>
            </div>
          </section>

          {isMember && (
            <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 sm:p-5">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] mb-3">
                Post in {selectedCommunity.name}
              </h2>
              <CreatePostForm defaultCommunityId={selectedCommunity.id} compact />
            </section>
          )}

          {communityPosts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No posts in this community yet"
              description="Join this space and publish the first conversation."
            />
          ) : (
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenDetail={(p) => setSelectedPost(p)}
                />
              ))}
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

  // Communities Directory View
  return (
    <AppShell hideRightSidebar pageTitle="Communities">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Communities
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Join focused engineering, design, and photography groups.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communities..."
              className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                selectedCategory === category
                  ? 'border-transparent bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                  : 'border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] text-slate-600 dark:text-[#94A3B8]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredCommunities.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No matching communities"
            description="Try a different search term or reset your category filter."
            actionLabel="Show All Communities"
            onAction={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCommunities.map((comm) => {
              const isMember = currentUser
                ? comm.memberIds.includes(currentUser.id)
                : false;
              const postCount = posts.filter((p) => p.communityId === comm.id).length;

              return (
                <div
                  key={comm.id}
                  className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate(`/communities/${comm.id}`)}
                      className="block w-full h-28 bg-[#0E121A] overflow-hidden"
                    >
                      <MediaImage
                        src={comm.bannerImage}
                        alt={comm.name}
                        className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                      />
                    </button>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#64748B]">
                        <span className="text-[#06B6D4] font-medium">{comm.category}</span>
                        <span className="tabular-nums">{postCount} posts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/communities/${comm.id}`)}
                        className="font-display text-lg font-bold text-slate-900 dark:text-[#F8FAFC] hover:text-[#8B5CF6] transition-colors text-left"
                      >
                        {comm.name}
                      </button>
                      <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed line-clamp-3">
                        {comm.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 dark:text-[#64748B] tabular-nums">
                      {formatCompactNumber(comm.memberIds.length)} members
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/communities/${comm.id}`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#F8FAFC] hover:border-[#06B6D4]"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleJoinCommunity(comm.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isMember
                            ? 'border border-slate-200 dark:border-[#252D3A] text-slate-600 dark:text-[#94A3B8]'
                            : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                        }`}
                      >
                        {isMember ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
