import { Bookmark, Compass } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { AppShell } from '../../components/layout/AppShell';
import { PostCard } from '../../components/posts/PostCard';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { useNexora } from '../../context/NexoraContext';
import { Post } from '../../types';

export function BookmarksPage() {
  const { posts, bookmarkedPostIds } = useNexora();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const savedPosts = useMemo(
    () =>
      bookmarkedPostIds
        .map((id) => posts.find((p) => p.id === id))
        .filter((p): p is Post => Boolean(p)),
    [posts, bookmarkedPostIds]
  );

  return (
    <AppShell pageTitle="Bookmarks">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Saved Bookmarks
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Posts you saved locally for reference and inspiration.
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#64748B]">
            {savedPosts.length} saved
          </span>
        </div>

        {savedPosts.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarked posts yet"
            description="Tap the bookmark icon on any post in your feed or Explore to keep it organized here."
            actionLabel="Explore Posts"
            onAction={() => navigate('/explore')}
          />
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
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
