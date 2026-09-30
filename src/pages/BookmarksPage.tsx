import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import {
  Bookmark,
  FolderPlus,
  Lock,
  Globe,
  Trash2,
  ExternalLink,
  Plus,
  Layers,
} from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { posts, toggleSave, collections, createCollection, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'media' | 'collections'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [privacy, setPrivacy] = useState<'Public' | 'Private'>('Public');

  const savedPosts = posts.filter((p) => p.isSaved);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCollection(name.trim(), desc.trim(), privacy);
    setName('');
    setDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[var(--primary)] fill-[var(--primary-light)]" />
            <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
              Saved Bookmarks & Collections
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Organize architecture insights, technical snippets, and discussions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-all shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl w-fit">
        {(['all', 'posts', 'media', 'collections'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              activeTab === tab
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab === 'collections' ? `Collections (${collections.length})` : tab}
          </button>
        ))}
      </div>

      {/* Collections Section */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)]">
                  {col.privacy === 'Private' ? (
                    <Lock className="h-3 w-3 text-amber-500" />
                  ) : (
                    <Globe className="h-3 w-3 text-sky-500" />
                  )}
                  <span>{col.privacy}</span>
                </span>
                <span className="text-[10px] text-[var(--muted)]">Updated {col.updatedAt}</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--text)]">{col.name}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                  {col.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="tabular-nums">{col.postIds.length + 1} saved items</span>
                <button
                  onClick={() => setActiveTab('all')}
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  View items
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Posts Grid */}
      {activeTab !== 'collections' && (
        <div className="space-y-4">
          {savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <div key={post.id} className="relative group">
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--muted)] space-y-3">
              <Bookmark className="mx-auto h-8 w-8 text-[var(--muted)]" />
              <p>You haven't saved any bookmarks yet.</p>
              <button
                onClick={() => navigate('feed')}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-xs font-semibold text-white shadow-xs"
              >
                Browse News Feed
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text)] mb-3">Create Saved Collection</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Concurrency & Threads"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief note about the items stored in this collection..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Visibility
                </label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                >
                  <option value="Public">Public (Visible on your profile)</option>
                  <option value="Private">Private (Only you can view)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs rounded-xl border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white shadow-xs hover:opacity-90"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
