import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Post } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle2,
  Globe,
  Users,
  Lock,
  MapPin,
  Smile,
  Send,
  Trash2,
  Edit3,
  Flag,
  VolumeX,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    toggleLike,
    toggleSave,
    addComment,
    deletePost,
    editPost,
    showConfirmDialog,
    setShareModalPost,
    setPreviewImage,
    navigate,
  } = useApp();

  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = post.author.id === currentUser.id;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput);
    setCommentInput('');
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    showConfirmDialog({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => deletePost(post.id),
    });
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    editPost(post.id, editContent);
    setIsEditing(false);
  };

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            referrerPolicy="no-referrer"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-1 ring-[var(--border)] cursor-pointer"
            onClick={() => navigate('profile', { username: post.author.username })}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() => navigate('profile', { username: post.author.username })}
                className="font-semibold text-sm text-[var(--text)] hover:underline cursor-pointer"
              >
                {post.author.name}
              </span>
              {post.author.isVerified && (
                <CheckCircle2 className="h-4 w-4 text-sky-500 fill-sky-500/10 shrink-0" />
              )}
              {post.feeling && (
                <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                  is feeling <span className="text-[var(--text-secondary)] font-medium">{post.feeling}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{post.timestamp}</span>
              <span>·</span>
              <span title={`Visibility: ${post.privacy}`} className="flex items-center">
                {post.privacy === 'public' && <Globe className="h-3 w-3" />}
                {post.privacy === 'friends' && <Users className="h-3 w-3" />}
                {post.privacy === 'only_me' && <Lock className="h-3 w-3" />}
              </span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                    <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                    <span>{post.location}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* More Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] transition-colors"
            aria-label="Post actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg backdrop-blur-md z-30">
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[var(--muted)]" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Post</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      toggleSave(post.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-[var(--muted)]" />
                    <span>{post.isSaved ? 'Remove Bookmark' : 'Save Post'}</span>
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                  >
                    <VolumeX className="h-3.5 w-3.5 text-[var(--muted)]" />
                    <span>Mute @{post.author.username}</span>
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Report Post</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 text-sm leading-relaxed text-[var(--text)] whitespace-pre-line">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          post.content
        )}
      </div>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              onClick={() => navigate('search')}
              className="text-xs font-medium text-[var(--primary)] hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Media Image */}
      {post.mediaUrl && (
        <div className="mt-3.5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]">
          <img
            src={post.mediaUrl}
            alt="Post Attachment"
            referrerPolicy="no-referrer"
            onClick={() => setPreviewImage(post.mediaUrl || null)}
            className="w-full max-h-[460px] object-cover hover:opacity-95 transition-opacity cursor-pointer"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.dataset.hasFailed) {
                img.dataset.hasFailed = 'true';
                img.src = '/src/assets/images/post_photo_tech_1790446531677.jpg';
              }
            }}
          />
        </div>
      )}

      {/* Metrics & Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Like */}
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors ${
              post.isLiked
                ? 'text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/20'
                : 'hover:text-[var(--text)] hover:bg-[var(--surface-secondary)]'
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-transform ${
                post.isLiked ? 'fill-rose-500 animate-like' : ''
              }`}
            />
            <span className="tabular-nums">{post.likesCount}</span>
            <span className="hidden sm:inline">Likes</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="tabular-nums">{post.commentsCount}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setShareModalPost(post)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="tabular-nums">{post.sharesCount}</span>
            <span className="hidden sm:inline">Shares</span>
          </button>
        </div>

        {/* Save Bookmark */}
        <button
          onClick={() => toggleSave(post.id)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors ${
            post.isSaved
              ? 'text-[var(--primary)] font-semibold bg-[var(--primary-light)]'
              : 'hover:text-[var(--text)] hover:bg-[var(--surface-secondary)]'
          }`}
          title={post.isSaved ? 'Saved to Bookmarks' : 'Save Bookmark'}
        >
          <Bookmark
            className={`h-4 w-4 ${post.isSaved ? 'fill-[var(--primary)] animate-bookmark' : ''}`}
          />
          <span className="hidden sm:inline">{post.isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-3.5 space-y-3 border-t border-[var(--border)] pt-3 animate-in fade-in duration-200">
          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0"
            />
            <input
              type="text"
              placeholder="Write a thoughtful comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--primary)] text-white disabled:opacity-40 transition-opacity"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>

          {/* Comment List */}
          {post.comments.length > 0 ? (
            <div className="space-y-2.5 pl-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-[var(--border)] mt-0.5 shrink-0"
                  />
                  <div className="flex-1 rounded-xl bg-[var(--surface-secondary)] px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[var(--text)]">
                        {comment.author.name}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-[var(--text-secondary)] leading-normal">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 text-center text-xs text-[var(--muted)]">
              No comments yet. Start the conversation!
            </div>
          )}
        </div>
      )}
    </article>
  );
};
