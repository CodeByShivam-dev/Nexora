import { AnimatePresence, motion } from 'motion/react';
import { Check, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createEditorialPostVisual } from '../../assets/visuals';
import { useNexora } from '../../context/NexoraContext';
import { StoryHighlight } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { MediaImage } from '../common/MediaResolver';

interface ManageHighlightModalProps {
  open: boolean;
  editingHighlight?: StoryHighlight | null;
  onClose: () => void;
}

const COVER_PRESETS = [
  createEditorialPostVisual('story_evening'),
  createEditorialPostVisual('design_system'),
  createEditorialPostVisual('architecture'),
  createEditorialPostVisual('workstation'),
  createEditorialPostVisual('alpine_dusk'),
];

export function ManageHighlightModal({
  open,
  editingHighlight = null,
  onClose,
}: ManageHighlightModalProps) {
  const {
    currentUser,
    stories,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    addToast,
  } = useNexora();

  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS[0]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);

  const myStories = currentUser
    ? stories.filter((s) => s.authorId === currentUser.id)
    : [];

  useEffect(() => {
    if (editingHighlight) {
      setTitle(editingHighlight.title);
      setCoverUrl(editingHighlight.coverUrl);
      setSelectedStoryIds(editingHighlight.storyIds);
    } else {
      setTitle('');
      const firstMedia = myStories.find((s) => s.mediaUrl)?.mediaUrl;
      setCoverUrl(firstMedia || COVER_PRESETS[0]);
      setSelectedStoryIds(myStories.slice(0, 1).map((s) => s.id));
    }
  }, [editingHighlight, open]);

  if (!currentUser) return null;

  const toggleStory = (storyId: string) => {
    setSelectedStoryIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast({ type: 'error', title: 'Give this highlight a title.' });
      return;
    }
    if (selectedStoryIds.length === 0) {
      addToast({ type: 'error', title: 'Select at least one story for this highlight.' });
      return;
    }

    if (editingHighlight) {
      updateHighlight(editingHighlight.id, {
        title,
        coverUrl,
        storyIds: selectedStoryIds,
      });
    } else {
      createHighlight({
        title,
        coverUrl,
        storyIds: selectedStoryIds,
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#252D3A]">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {editingHighlight ? 'Edit Story Highlight' : 'New Story Highlight'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2230] flex items-center justify-center"
                aria-label="Close highlight modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-1.5">
                  Highlight Title
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Tokyo Frames, UI Tokens"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-2">
                  Select Cover
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {Array.from(
                    new Set([
                      ...myStories
                        .map((s) => s.mediaUrl)
                        .filter((u): u is string => Boolean(u)),
                      ...COVER_PRESETS,
                    ])
                  ).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverUrl(url)}
                      className={`w-14 h-14 rounded-full overflow-hidden border-2 shrink-0 transition-transform ${
                        coverUrl === url
                          ? 'border-[#06B6D4] scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <MediaImage
                        src={url}
                        alt={`Cover option ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-2">
                  Include Stories ({selectedStoryIds.length} selected)
                </label>
                {myStories.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-[#64748B] py-3">
                    Create a story first so you can pin it to your profile highlights.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {myStories.map((story) => {
                      const checked = selectedStoryIds.includes(story.id);
                      return (
                        <button
                          key={story.id}
                          type="button"
                          onClick={() => toggleStory(story.id)}
                          className={`relative aspect-[9/14] rounded-xl overflow-hidden border-2 text-left transition-all ${
                            checked
                              ? 'border-[#8B5CF6]'
                              : 'border-slate-200 dark:border-[#252D3A] opacity-75 hover:opacity-100'
                          }`}
                          style={
                            story.mediaType === 'text'
                              ? { background: story.backgroundStyle || '#141A24' }
                              : undefined
                          }
                        >
                          {story.mediaUrl && story.mediaType === 'image' && (
                            <MediaImage
                              src={story.mediaUrl}
                              alt={story.caption || 'Story'}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {story.mediaType === 'text' && (
                            <div className="p-2 h-full flex items-center justify-center text-[10px] text-white text-center line-clamp-4">
                              {story.textOverlay}
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white truncate">
                            {formatRelativeTime(story.createdAt)}
                          </div>
                          {checked && (
                            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#252D3A] flex items-center justify-between gap-3">
                {editingHighlight ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteHighlight(editingHighlight.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#252D3A] text-slate-600 dark:text-[#94A3B8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95"
                  >
                    {editingHighlight ? 'Save Highlight' : 'Create Highlight'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
