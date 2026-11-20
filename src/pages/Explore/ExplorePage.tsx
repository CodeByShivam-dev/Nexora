import { Compass, Hash, Heart, MessageCircle, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { MediaImage } from '../../components/common/MediaResolver';
import { AppShell } from '../../components/layout/AppShell';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { useNexora } from '../../context/NexoraContext';
import { Post, PostCategory } from '../../types';
import { formatCompactNumber } from '../../utils/formatters';

const CATEGORIES = ['All', ...Object.values(PostCategory)];

export function ExplorePage() {
  const { posts, users, currentUser, getUserById, toggleFollow } = useNexora();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId) {
      const found = posts.find((p) => p.id === postId);
      if (found) setSelectedPost(found);
    }
  }, [searchParams, posts]);

  const trendingHashtags = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) => {
      p.hashtags.forEach((tag) => {
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [posts]);

  const popularCreators = useMemo(
    () =>
      [...users]
        .sort((a, b) => b.followers.length - a.followers.length)
        .slice(0, 4),
    [users]
  );

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...posts]
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (!q) return true;
        const author = getUserById(p.authorId);
        return (
          p.content.toLowerCase().includes(q) ||
          p.hashtags.some((h) => h.includes(q.replace(/^#/, ''))) ||
          author?.fullName.toLowerCase().includes(q) ||
          author?.username.toLowerCase().includes(q)
        );
      })
      .sort(
        (a, b) =>
          b.likes.length + b.comments.length - (a.likes.length + a.comments.length)
      );
  }, [posts, selectedCategory, query, getUserById]);

  return (
    <AppShell hideRightSidebar pageTitle="Explore">
      <div className="space-y-6">
        {/* Header + Large Search Input */}
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Explore NEXORA
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Discover visual stories, engineering deep dives, and popular creators.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            className="relative w-full"
          >
            <Search className="w-5 h-5 text-slate-400 dark:text-[#64748B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trending topics, #hashtags, creators, or filter masonry grid..."
              className="w-full rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] pl-12 pr-28 py-3.5 text-sm sm:text-base text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                selectedCategory === category
                  ? 'border-transparent bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                  : 'border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Popular Creators Strip */}
        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Popular Creators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {popularCreators.map((creator) => {
              const isMe = currentUser?.id === creator.id;
              const isFollowing = currentUser?.following.includes(creator.id) ?? false;
              return (
                <div
                  key={creator.id}
                  className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 flex flex-col justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${creator.username}`)}
                    className="flex items-center gap-3 text-left min-w-0"
                  >
                    <Avatar
                      src={creator.avatar}
                      name={creator.fullName}
                      size="md"
                      verified={creator.verified}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                        {creator.fullName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
                        @{creator.username} · {formatCompactNumber(creator.followers.length)} followers
                      </p>
                    </div>
                  </button>

                  {!isMe && currentUser && (
                    <button
                      type="button"
                      onClick={() => toggleFollow(creator.id)}
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        isFollowing
                          ? 'border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#94A3B8] hover:border-[#EF4444] hover:text-[#EF4444]'
                          : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
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

        {/* Trending Hashtags Bar */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Trending Tags:
            </span>
            {trendingHashtags.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent('#' + tag)}`)}
                className="inline-flex items-center gap-1 text-[#06B6D4] hover:underline font-medium"
              >
                <Hash className="w-3 h-3" />
                <span>{tag}</span>
                <span className="text-slate-400 dark:text-[#64748B] tabular-nums">
                  ({count})
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Masonry Image & Post Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Trending Discovery Masonry
            </h2>
            <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#64748B]">
              {filteredPosts.length} posts
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No matching posts found"
              description="Try switching categories or clearing your search query."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedCategory('All');
                setQuery('');
              }}
            />
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filteredPosts.map((post, idx) => {
                const author = getUserById(post.authorId);
                const tallImage = idx % 3 === 0 ? 'h-64' : idx % 2 === 0 ? 'h-52' : 'h-44';
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="break-inside-avoid w-full group text-left rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-hidden hover:border-[#8B5CF6]/60 transition-colors flex flex-col"
                  >
                    {post.images.length > 0 && (
                      <div className={`relative w-full ${tallImage} overflow-hidden bg-slate-100 dark:bg-[#0E121A]`}>
                        <MediaImage
                          src={post.images[0]}
                          alt={post.content.slice(0, 60)}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={author?.avatar}
                          name={author?.fullName || 'Creator'}
                          size="xs"
                          verified={author?.verified}
                        />
                        <div className="min-w-0 text-xs">
                          <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate block">
                            {author?.fullName || 'Creator'}
                          </span>
                          <span className="text-slate-500 dark:text-[#64748B]">
                            @{author?.username} · {post.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-[#E2E8F0] leading-relaxed line-clamp-4">
                        {post.content}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-[#252D3A] flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-[#EF4444]" />
                          <span className="tabular-nums">{post.likes.length}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-[#06B6D4]" />
                          <span className="tabular-nums">{post.comments.length}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
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
