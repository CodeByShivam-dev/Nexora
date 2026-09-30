import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostComposer } from '../components/PostComposer';
import { PostCard } from '../components/PostCard';
import { Rss, Filter, Sparkles, Image as ImageIcon, Flame } from 'lucide-react';

export const NewsFeedPage: React.FC = () => {
  const { posts, currentUser } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'following' | 'media'>('all');

  const filteredPosts = posts.filter((p) => {
    if (filterTab === 'following') return p.author.id !== currentUser.id;
    if (filterTab === 'media') return Boolean(p.mediaUrl);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Feed Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">News Feed</h1>
          <p className="text-xs text-[var(--muted)]">Chronological, unpolluted updates from your circle.</p>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === 'all'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterTab('following')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === 'following'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setFilterTab('media')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === 'media'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Media
          </button>
        </div>
      </div>

      {/* Post Composer */}
      <PostComposer />

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] text-[var(--muted)]">
              <Rss className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text)]">No posts found in this view</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Try switching back to "All Activity" or share the first update to your feed!
            </p>
            <button
              onClick={() => setFilterTab('all')}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-xs font-semibold text-white shadow-xs"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
