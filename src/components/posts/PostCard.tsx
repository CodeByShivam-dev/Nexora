import { AnimatePresence, motion } from 'motion/react';
import {
  Bookmark,
  Check,
  Edit3,
  Flag,
  Heart,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { Post, PostCategory } from '../../types';
import { formatCompactNumber, formatRelativeTime } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';
import { MediaImage, MediaVideo } from '../common/MediaResolver';
import { ConfirmModal } from '../modals/ConfirmModal';
import { ReportModal } from '../modals/ReportModal';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  defaultShowComments?: boolean;
  onOpenDetail?: (post: Post) => void;
}

export function PostCard({
  post,
  defaultShowComments = false,
  onOpenDetail,
}: PostCardProps) {
  const {
    currentUser,
    getUserById,
    toggleLikePost,
    toggleBookmark,
    isBookmarked,
    incrementShareCount,
    deletePost,
    editPost,
    addToast,
  } = useNexora();
  const navigate = useNavigate();

  const author = getUserById(post.authorId);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editCategory, setEditCategory] = useState<PostCategory>(post.category);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const bookmarked = isBookmarked(post.id);
  const isOwn = currentUser?.id === post.authorId;
  const totalComments =
    post.comments.length +
    post.comments.reduce((acc, c) => acc + c.replies.length, 0);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/explore?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      addToast({ type: 'success', title: 'Post link copied to clipboard' });
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      addToast({ type: 'info', title: 'Share link ready', description: url });
    }
    setMenuOpen(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/explore?post=${post.id}`;
    incrementShareCount(post.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${author?.fullName || 'Creator'} on NEXORA`,
          text: post.content.slice(0, 110),
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed; fall back to copy
      }
    }
    await handleCopyLink();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    editPost(post.id, editContent, editCategory, post.hashtags);
    setIsEditing(false);
  };

  const renderFormattedContent = (text: string) => {
    const tokens = text.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_.]+)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('#')) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => navigate(`/search?q=${encodeURIComponent(token)}`)}
            className="text-[#06B6D4] hover:underline font-medium"
          >
            {token}
          </button>
        );
      }
      if (token.startsWith('@')) {
        const uname = token.slice(1);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => navigate(`/profile/${uname}`)}
            className="text-[#8B5CF6] hover:underline font-medium"
          >
            {token}
          </button>
        );
      }
      return <span key={idx}>{token}</span>;
    });
  };

  return (
    <>
      <article className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 sm:p-5 transition-colors hover:border-slate-300 dark:hover:border-[#323D4E]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={author?.avatar}
              name={author?.fullName || 'Creator'}
              size="md"
              verified={author?.verified}
              onClick={() => author && navigate(`/profile/${author.username}`)}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => author && navigate(`/profile/${author.username}`)}
                  className="font-display font-semibold text-[15px] text-slate-900 dark:text-[#F8FAFC] hover:underline truncate"
                >
                  {author?.fullName || 'NEXORA Creator'}
                </button>
                <span className="text-xs text-slate-500 dark:text-[#64748B] truncate">
                  @{author?.username || 'creator'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#64748B]">
                <span>{formatRelativeTime(post.createdAt)}</span>
                <span aria-hidden="true">·</span>
                <span>{post.category}</span>
                {post.updatedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Edited</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] transition-colors"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 mt-1.5 w-48 z-30 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#1A2230] shadow-xl py-1.5"
                >
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#252D3A]/60"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-[#22C55E]" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                    Copy post link
                  </button>
                  {isOwn ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setEditContent(post.content);
                          setEditCategory(post.category);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#252D3A]/60"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete post
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReportPostId(post.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10"
                    >
                      <Flag className="w-4 h-4" />
                      Report post
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Body / Edit mode */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="mt-3.5 space-y-3">
            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={600}
              className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] p-3 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as PostCategory)}
                className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3 py-1.5 text-xs text-slate-800 dark:text-[#F8FAFC]"
              >
                {Object.values(PostCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#252D3A] text-slate-600 dark:text-[#94A3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                >
                  Save changes
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-3.5 space-y-3">
            {post.content && (
              <p className="text-[15px] leading-relaxed text-slate-800 dark:text-[#F1F5F9] whitespace-pre-line break-words">
                {renderFormattedContent(post.content)}
              </p>
            )}

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#06B6D4]">
                {post.hashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/search?q=${encodeURIComponent('#' + tag)}`)}
                    className="hover:underline font-medium"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Images Gallery */}
        {post.images.length > 0 && (
          <div
            className={`mt-3.5 grid gap-2 overflow-hidden rounded-xl ${
              post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {post.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onOpenDetail?.(post)}
                className={`relative block w-full overflow-hidden rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-100 dark:bg-[#0E121A] text-left group ${
                  post.images.length === 3 && idx === 0 ? 'col-span-2' : ''
                }`}
              >
                <MediaImage
                  src={img}
                  alt={`Post visual by ${author?.fullName || 'creator'}`}
                  className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.01] ${
                    post.images.length === 1 ? 'max-h-[420px]' : 'h-52'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Video Preview */}
        {post.videoUrl && (
          <div className="mt-3.5 overflow-hidden rounded-xl border border-slate-200 dark:border-[#252D3A] bg-[#090B10]">
            <MediaVideo
              src={post.videoUrl}
              controls
              autoPlay={false}
              muted={false}
              className="w-full max-h-[420px] object-contain"
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#252D3A]/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => toggleLikePost(post.id)}
              className={`min-h-[40px] px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isLiked
                  ? 'text-[#EF4444] bg-[#EF4444]/10'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="tabular-nums">{formatCompactNumber(post.likes.length)}</span>
            </motion.button>

            <button
              type="button"
              onClick={() => setShowComments((prev) => !prev)}
              className={`min-h-[40px] px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                showComments
                  ? 'text-[#06B6D4] bg-[#06B6D4]/10'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
              aria-label="Toggle comments"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="tabular-nums">{formatCompactNumber(totalComments)}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="min-h-[40px] px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors"
              aria-label="Share post"
            >
              <Share2 className="w-4 h-4" />
              <span className="tabular-nums">{formatCompactNumber(post.sharesCount)}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleBookmark(post.id)}
            className={`min-h-[40px] min-w-[40px] px-2.5 rounded-xl inline-flex items-center justify-center transition-colors ${
              bookmarked
                ? 'text-[#8B5CF6] bg-[#8B5CF6]/10'
                : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Comments */}
        {showComments && <CommentSection postId={post.id} comments={post.comments} />}
      </article>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Delete post?"
        description="This removes the post from your local browser feed. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => deletePost(post.id)}
        onClose={() => setConfirmDeleteOpen(false)}
      />

      <ReportModal postId={reportPostId} onClose={() => setReportPostId(null)} />
    </>
  );
}
