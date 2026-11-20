import { Compass, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonCard';
import { AppShell } from '../../components/layout/AppShell';
import { CreatePostForm } from '../../components/posts/CreatePostModal';
import { PostCard } from '../../components/posts/PostCard';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { StoriesBar } from '../../components/stories/StoriesBar';
import { useNexora } from '../../context/NexoraContext';
import { Post } from '../../types';

type FeedFilter = 'for_you' | 'following' | 'latest' | 'media';

const PAGE_SIZE = 5;

export function HomePage() {
  const { currentUser, posts } = useNexora();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FeedFilter>('for_you');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filteredPosts = useMemo(() => {
    const base = [...posts];
    if (filter === 'following' && currentUser) {
      return base.filter(
        (p) =>
          p.authorId === currentUser.id ||
          currentUser.following.includes(p.authorId)
      );
    }
    if (filter === 'media') {
      return base.filter((p) => p.images.length > 0 || Boolean(p.videoUrl));
    }
    if (filter === 'latest') {
      return base.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return base.sort((a, b) => {
      const scoreA =
        a.likes.length * 2 +
        a.comments.length * 3 +
        new Date(a.createdAt).getTime() / 1e10;
      const scoreB =
        b.likes.length * 2 +
        b.comments.length * 3 +
        new Date(b.createdAt).getTime() / 1e10;
      return scoreB - scoreA;
    });
  }, [posts, filter, currentUser]);

  const handleFilterChange = (next: FeedFilter) => {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
    setIsFiltering(true);
    window.setTimeout(() => setIsFiltering(false), 160);
  };

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <AppShell pageTitle="Home">
      <div className="space-y-5">
        <StoriesBar />

        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 sm:p-5">
          <CreatePostForm compact />
        </section>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-x-auto no-scrollbar">
            {[
              { id: 'for_you' as FeedFilter, label: 'For You' },
              { id: 'following' as FeedFilter, label: 'Following' },
              { id: 'latest' as FeedFilter, label: 'Latest' },
              { id: 'media' as FeedFilter, label: 'Media' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#64748B] whitespace-nowrap">
            {filteredPosts.length} posts
          </span>
        </div>

        {isFiltering ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : displayedPosts.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No posts in this feed yet"
            description="Follow more creators or explore trending topics to populate your Following stream."
            actionLabel="Explore Creators"
            onAction={() => navigate('/explore')}
          />
        ) : (
          <div className="space-y-4">
            {displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetail={(p) => setSelectedPost(p)}
              />
            ))}

            {hasMore && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] text-slate-800 dark:text-[#F8FAFC] hover:border-[#8B5CF6] transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                  Load More Posts ({filteredPosts.length - visibleCount} remaining)
                </button>
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
