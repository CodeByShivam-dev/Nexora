import { AnimatePresence, motion } from 'motion/react';
import { Film, Hash, ImagePlus, Smile, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { saveMediaFile, validateMediaFile } from '../../services/mediaDB';
import { PostCategory } from '../../types';
import { Avatar } from '../common/Avatar';
import { MediaImage, MediaVideo } from '../common/MediaResolver';

const QUICK_EMOJIS = ['🚀', '✨', '🔥', '💡', '🎨', '📸', '💻', '🙌', '⚡', '🌌'];
const MAX_CHARS = 500;

interface CreatePostFormProps {
  defaultCommunityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CreatePostForm({
  defaultCommunityId,
  onSuccess,
  onCancel,
  compact = false,
}: CreatePostFormProps) {
  const { currentUser, communities, createPost, addToast } = useNexora();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [category, setCategory] = useState<PostCategory>(PostCategory.TECHNOLOGY);
  const [communityId, setCommunityId] = useState(defaultCommunityId || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) return null;

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 4) {
      addToast({ type: 'error', title: 'Maximum 4 images per post' });
      return;
    }

    setUploading(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const validation = validateMediaFile(file, 'image');
        if (!validation.valid) {
          addToast({ type: 'error', title: validation.error || 'Invalid image' });
          continue;
        }
        const uri = await saveMediaFile(file);
        added.push(uri);
      }
      if (added.length > 0) {
        setImages((prev) => [...prev, ...added]);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Media upload failed',
        description: err instanceof Error ? err.message : 'Storage error',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validation = validateMediaFile(file, 'video');
    if (!validation.valid) {
      addToast({ type: 'error', title: validation.error || 'Invalid video' });
      return;
    }
    setUploading(true);
    try {
      const uri = await saveMediaFile(file);
      setVideoUrl(uri);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Video upload failed',
        description: err instanceof Error ? err.message : 'Storage error',
      });
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleAddHashtag = () => {
    const clean = hashtagInput.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    if (!hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean]);
    }
    setHashtagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && !videoUrl) {
      addToast({ type: 'error', title: 'Write a caption or attach media first.' });
      return;
    }
    createPost({
      content,
      images,
      videoUrl,
      hashtags,
      category,
      communityId: communityId || undefined,
    });
    setContent('');
    setImages([]);
    setVideoUrl(undefined);
    setHashtags([]);
    setHashtagInput('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-3">
        <Avatar src={currentUser.avatar} name={currentUser.fullName} size="md" />
        <div className="flex-1 min-w-0">
          <textarea
            rows={compact ? 3 : 4}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Share an insight, project update, or visual story... Use #hashtags or @mentions"
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] p-3.5 text-[15px] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-[#64748B]">
            <span>Stored locally in your browser</span>
            <span className={`tabular-nums ${content.length >= MAX_CHARS - 30 ? 'text-[#EF4444]' : ''}`}>
              {content.length}/{MAX_CHARS}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Images Preview */}
      {images.length > 0 && (
        <div className={`grid gap-2.5 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.map((uri, idx) => (
            <div
              key={uri}
              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#252D3A] bg-slate-100 dark:bg-[#0E121A]"
            >
              <MediaImage
                src={uri}
                alt={`Selected attachment ${idx + 1}`}
                className="w-full h-44 object-cover"
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#EF4444] transition-colors"
                aria-label="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selected Video Preview */}
      {videoUrl && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#252D3A] bg-[#090B10]">
          <MediaVideo
            src={videoUrl}
            controls
            autoPlay={false}
            muted={false}
            className="w-full max-h-64 object-contain"
          />
          <button
            type="button"
            onClick={() => setVideoUrl(undefined)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-[#EF4444] transition-colors"
            aria-label="Remove video"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hashtags & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Hash className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddHashtag();
                }
              }}
              placeholder="Add hashtag"
              className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>
          <button
            type="button"
            onClick={handleAddHashtag}
            className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230]"
          >
            Add
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PostCategory)}
            aria-label="Category"
            className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3 py-2 text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
          >
            {Object.values(PostCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            aria-label="Community"
            className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3 py-2 text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="">Personal Feed</option>
            {communities.map((comm) => (
              <option key={comm.id} value={comm.id}>
                {comm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {hashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
              className="inline-flex items-center gap-1 text-[#06B6D4] hover:text-[#EF4444] transition-colors"
            >
              <span>#{tag}</span>
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="relative pt-3 border-t border-slate-200 dark:border-[#252D3A] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="min-h-[38px] px-2.5 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] transition-colors"
          >
            <ImagePlus className="w-4 h-4 text-[#06B6D4]" />
            <span>{uploading ? 'Saving...' : 'Images'}</span>
          </button>

          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => handleVideoSelected(e.target.files)}
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="min-h-[38px] px-2.5 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] transition-colors"
          >
            <Film className="w-4 h-4 text-[#8B5CF6]" />
            <span>Video</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="min-h-[38px] px-2.5 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230] transition-colors"
          >
            <Smile className="w-4 h-4 text-[#22C55E]" />
            <span className="hidden sm:inline">Emoji</span>
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230]"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={uploading || (!content.trim() && images.length === 0 && !videoUrl)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 disabled:opacity-45 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            Publish
          </button>
        </div>

        {showEmojiPicker && (
          <div className="absolute left-0 bottom-14 z-30 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#1A2230] p-2 shadow-xl">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setContent((prev) => (prev + emoji).slice(0, MAX_CHARS));
                  setShowEmojiPicker(false);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252D3A] text-base flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

export function CreatePostModal() {
  const { isCreatePostOpen, setCreatePostOpen } = useNexora();

  return (
    <AnimatePresence>
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCreatePostOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-[#252D3A]">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Create Post
              </h2>
              <button
                type="button"
                onClick={() => setCreatePostOpen(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2230]"
                aria-label="Close create post modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CreatePostForm
              onSuccess={() => setCreatePostOpen(false)}
              onCancel={() => setCreatePostOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
