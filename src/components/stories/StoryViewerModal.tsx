import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { StoryPrivacy } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';
import { MediaImage, MediaVideo } from '../common/MediaResolver';

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '😍', '👏', '😮'];
const IMAGE_DURATION_MS = 5000;
const MAX_VIDEO_DURATION_MS = 30000;

export function StoryViewerModal() {
  const {
    currentUser,
    users,
    stories,
    highlights,
    visibleStories,
    activeStoryUserId,
    activeHighlightId,
    setActiveStoryUserId,
    setActiveHighlightId,
    markStoryViewed,
    reactToStory,
    replyToStory,
    deleteStory,
  } = useNexora();
  const navigate = useNavigate();

  const activeHighlight = useMemo(
    () =>
      activeHighlightId
        ? highlights.find((h) => h.id === activeHighlightId) ?? null
        : null,
    [highlights, activeHighlightId]
  );

  // Author list when browsing active stories
  const authorIds = useMemo(() => {
    const order: string[] = [];
    visibleStories.forEach((s) => {
      if (!order.includes(s.authorId)) order.push(s.authorId);
    });
    return order;
  }, [visibleStories]);

  // Segments list: either Highlight stories OR active user stories
  const activeSegments = useMemo(() => {
    if (activeHighlight) {
      return activeHighlight.storyIds
        .map((id) => stories.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s));
    }
    if (activeStoryUserId) {
      return visibleStories
        .filter((s) => s.authorId === activeStoryUserId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }
    return [];
  }, [activeHighlight, stories, activeStoryUserId, visibleStories]);

  const isOpen = Boolean(activeHighlight || activeStoryUserId);

  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(IMAGE_DURATION_MS);
  const [replyText, setReplyText] = useState('');
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const currentStory = activeSegments[storyIndex] ?? null;
  const author = useMemo(() => {
    const uid = activeHighlight?.userId ?? currentStory?.authorId ?? activeStoryUserId;
    return users.find((u) => u.id === uid) ?? null;
  }, [users, activeHighlight, currentStory, activeStoryUserId]);

  useEffect(() => {
    setStoryIndex(0);
    setProgress(0);
    setPaused(false);
    setShowInsightsDrawer(false);
    setMenuOpen(false);
  }, [activeStoryUserId, activeHighlightId]);

  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);
    setDurationMs(currentStory.mediaType === 'video' ? 15000 : IMAGE_DURATION_MS);
    markStoryViewed(currentStory.id);
  }, [currentStory?.id, markStoryViewed]);

  const closeViewer = useCallback(() => {
    setActiveStoryUserId(null);
    setActiveHighlightId(null);
    setShowInsightsDrawer(false);
    setMenuOpen(false);
  }, [setActiveStoryUserId, setActiveHighlightId]);

  const goNext = useCallback(() => {
    if (!isOpen) return;
    if (storyIndex + 1 < activeSegments.length) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
      return;
    }
    if (activeHighlight) {
      closeViewer();
      return;
    }
    if (activeStoryUserId) {
      const currentAuthorPos = authorIds.indexOf(activeStoryUserId);
      if (currentAuthorPos !== -1 && currentAuthorPos + 1 < authorIds.length) {
        setActiveStoryUserId(authorIds[currentAuthorPos + 1]);
      } else {
        closeViewer();
      }
    }
  }, [
    isOpen,
    storyIndex,
    activeSegments.length,
    activeHighlight,
    activeStoryUserId,
    authorIds,
    setActiveStoryUserId,
    closeViewer,
  ]);

  const goPrev = useCallback(() => {
    if (!isOpen) return;
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
      return;
    }
    if (activeHighlight) {
      setProgress(0);
      return;
    }
    if (activeStoryUserId) {
      const currentAuthorPos = authorIds.indexOf(activeStoryUserId);
      if (currentAuthorPos > 0) {
        setActiveStoryUserId(authorIds[currentAuthorPos - 1]);
      } else {
        setProgress(0);
      }
    }
  }, [
    isOpen,
    storyIndex,
    activeHighlight,
    activeStoryUserId,
    authorIds,
    setActiveStoryUserId,
  ]);

  useEffect(() => {
    if (!currentStory || paused || showInsightsDrawer) return;
    const stepMs = 50;
    const increment = (stepMs / durationMs) * 100;

    const interval = window.setInterval(() => {
      setProgress((prev) => (prev + increment >= 100 ? 100 : prev + increment));
    }, stepMs);

    return () => window.clearInterval(interval);
  }, [currentStory, paused, showInsightsDrawer, durationMs]);

  useEffect(() => {
    if (progress >= 100 && currentStory) {
      goNext();
    }
  }, [progress, currentStory, goNext]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (paused || showInsightsDrawer) {
      vid.pause();
    } else {
      vid.play().catch(() => {});
    }
  }, [paused, showInsightsDrawer, currentStory?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') {
        if (e.key === 'Escape') closeViewer();
        return;
      }
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeViewer, goNext, goPrev]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStory || !replyText.trim()) return;
    replyToStory(currentStory.id, replyText);
    setReplyText('');
  };

  const handleDeleteCurrent = () => {
    if (!currentStory) return;
    const idToDelete = currentStory.id;
    const remaining = activeSegments.length - 1;
    deleteStory(idToDelete);
    setMenuOpen(false);
    if (remaining <= 0) {
      closeViewer();
    } else if (storyIndex >= remaining) {
      setStoryIndex(remaining - 1);
    }
  };

  const isOwnStory = currentUser?.id === author?.id;
  const viewersList = useMemo(
    () =>
      currentStory
        ? users.filter((u) => currentStory.viewedBy.includes(u.id))
        : [],
    [currentStory, users]
  );

  const textSizeClass =
    currentStory?.textSize === 'sm'
      ? 'text-lg'
      : currentStory?.textSize === 'lg'
      ? 'text-3xl'
      : 'text-2xl';
  const textAlignClass =
    currentStory?.textAlign === 'left'
      ? 'text-left'
      : currentStory?.textAlign === 'right'
      ? 'text-right'
      : 'text-center';

  return (
    <AnimatePresence>
      {isOpen && currentStory && author && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[95] bg-[#050609]/95 backdrop-blur-md flex items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Story viewer"
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous story"
            className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-[#141A24] border border-[#252D3A] text-[#F8FAFC] hover:bg-[#1A2230] mr-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="relative w-full h-full sm:h-[88vh] sm:max-h-[780px] sm:max-w-[430px] sm:rounded-2xl border-0 sm:border sm:border-[#252D3A] bg-[#090B10] overflow-hidden shadow-2xl flex flex-col justify-between select-none"
            style={
              currentStory.mediaType === 'text'
                ? { background: currentStory.backgroundStyle || '#141A24' }
                : undefined
            }
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const diff = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(diff) > 45) {
                if (diff < 0) goNext();
                else goPrev();
              }
              touchStartX.current = null;
            }}
          >
            {/* Media Layer */}
            {currentStory.mediaType === 'image' && currentStory.mediaUrl && (
              <MediaImage
                src={currentStory.mediaUrl}
                alt={currentStory.caption || `Story by ${author.fullName}`}
                className={`absolute inset-0 w-full h-full ${
                  currentStory.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                }`}
              />
            )}
            {currentStory.mediaType === 'video' && currentStory.mediaUrl && (
              <MediaVideo
                videoRef={videoRef}
                src={currentStory.mediaUrl}
                muted={muted}
                autoPlay
                playsInline
                onLoadedMetadata={(dur) => {
                  const ms = Math.min(Math.max(dur * 1000, 3000), MAX_VIDEO_DURATION_MS);
                  setDurationMs(ms);
                }}
                onEnded={goNext}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Contrast Scrims */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

            {/* Tap Navigation Zones: Left / Center Pause / Right */}
            <div className="absolute inset-y-20 inset-x-0 z-10 grid grid-cols-4">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous segment"
                className="col-span-1 w-full h-full cursor-pointer bg-transparent"
              />
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? 'Resume story' : 'Pause story'}
                className="col-span-2 w-full h-full cursor-pointer bg-transparent"
              />
              <button
                type="button"
                onClick={goNext}
                aria-label="Next segment"
                className="col-span-1 w-full h-full cursor-pointer bg-transparent"
              />
            </div>

            {/* Top Bar */}
            <div className="relative z-20 p-3.5 space-y-3">
              <div className="flex items-center gap-1.5">
                {activeSegments.map((s, idx) => {
                  const pct =
                    idx < storyIndex ? 100 : idx === storyIndex ? progress : 0;
                  return (
                    <div
                      key={s.id}
                      className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-[width] duration-75"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeViewer();
                    navigate(`/profile/${author.username}`);
                  }}
                  className="flex items-center gap-2.5 min-w-0 text-left"
                >
                  <Avatar
                    src={author.avatar}
                    name={author.fullName}
                    size="sm"
                    verified={author.verified}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {activeHighlight
                        ? `${activeHighlight.title} · ${author.username}`
                        : author.fullName}
                    </p>
                    <p className="text-[11px] text-white/75">
                      {formatRelativeTime(currentStory.createdAt)} ·{' '}
                      {currentStory.privacy === StoryPrivacy.CLOSE_FRIENDS
                        ? 'Close Friends'
                        : currentStory.privacy === StoryPrivacy.FOLLOWERS
                        ? 'Followers'
                        : 'Public'}
                      {paused ? ' · Paused' : ''}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0 relative">
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    aria-label={paused ? 'Resume story' : 'Pause story'}
                    className="w-9 h-9 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center"
                  >
                    {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  {currentStory.mediaType === 'video' && (
                    <button
                      type="button"
                      onClick={() => setMuted((m) => !m)}
                      aria-label={muted ? 'Unmute video' : 'Mute video'}
                      className="w-9 h-9 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center"
                    >
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Story options"
                    className="w-9 h-9 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeViewer}
                    aria-label="Close story viewer"
                    className="w-9 h-9 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-11 w-48 rounded-xl border border-[#252D3A] bg-[#141A24] shadow-xl py-1 z-30">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setShowInsightsDrawer(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#F8FAFC] hover:bg-[#1A2230]"
                      >
                        Interactions &amp; replies ({currentStory.replies.length})
                      </button>
                      {isOwnStory && (
                        <button
                          type="button"
                          onClick={handleDeleteCurrent}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete story
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          closeViewer();
                          navigate(`/profile/${author.username}`);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#F8FAFC] hover:bg-[#1A2230]"
                      >
                        View profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Text Overlay */}
            {currentStory.textOverlay && (
              <div className="relative z-10 px-7 pointer-events-none flex items-center justify-center">
                <p
                  className={`w-full font-display font-bold text-white leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] break-words ${textSizeClass} ${textAlignClass}`}
                >
                  {currentStory.textOverlay}
                </p>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="relative z-20 p-4 space-y-3">
              {currentStory.caption && (
                <p className="text-sm text-white/95 leading-relaxed drop-shadow">
                  {currentStory.caption}
                </p>
              )}

              {/* Reactions & Sent Replies Strip */}
              <div className="flex items-center justify-between gap-2">
                {currentStory.reactions.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentStory.reactions.slice(-6).map((r, idx) => (
                      <span
                        key={`${r.userId}-${idx}`}
                        className="text-sm bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/10"
                      >
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span />
                )}

                {currentStory.replies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowInsightsDrawer(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 border border-white/15 text-[11px] font-medium text-white hover:bg-black/75"
                  >
                    <MessageCircle className="w-3 h-3 text-[#06B6D4]" />
                    {currentStory.replies.length}{' '}
                    {currentStory.replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                )}
              </div>

              {isOwnStory ? (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInsightsDrawer(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/55 border border-white/15 text-xs font-medium text-white hover:bg-black/75"
                  >
                    <Eye className="w-4 h-4 text-[#06B6D4]" />
                    <span className="tabular-nums">
                      {currentStory.viewedBy.length} views · {currentStory.reactions.length} reactions
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCurrent}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-xs font-medium text-[#FCA5A5] hover:bg-[#EF4444]/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => reactToStory(currentStory.id, emoji)}
                        className="w-10 h-10 rounded-full bg-black/45 border border-white/10 hover:scale-110 transition-transform text-lg flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onFocus={() => setPaused(true)}
                      onBlur={() => setPaused(false)}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${author.fullName.split(' ')[0]}...`}
                      className="flex-1 min-w-0 rounded-xl border border-white/20 bg-black/50 backdrop-blur-md px-3.5 py-2.5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-[#06B6D4]"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      aria-label="Send story reply"
                      className="min-w-[42px] min-h-[42px] rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Insights & Reply History Drawer */}
            <AnimatePresence>
              {showInsightsDrawer && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-0 bottom-0 z-40 max-h-[72%] rounded-t-2xl border-t border-[#252D3A] bg-[#141A24] p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#252D3A]">
                    <h4 className="font-display text-sm font-semibold text-white">
                      Story Activity ({viewersList.length} views · {currentStory.replies.length} replies)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowInsightsDrawer(false)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
                      aria-label="Close activity drawer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 overflow-y-auto space-y-4">
                    {/* Replies History */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#94A3B8]">
                        Local Story Replies
                      </p>
                      {currentStory.replies.length === 0 ? (
                        <p className="text-xs text-[#64748B]">No replies sent yet.</p>
                      ) : (
                        currentStory.replies.map((rep) => {
                          const repUser = users.find((u) => u.id === rep.userId);
                          return (
                            <div
                              key={rep.id}
                              className="rounded-xl border border-[#252D3A] bg-[#0E121A] p-2.5 flex items-start gap-2.5"
                            >
                              <Avatar
                                src={repUser?.avatar}
                                name={repUser?.fullName || 'User'}
                                size="xs"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white">
                                  {repUser?.fullName || 'Creator'}{' '}
                                  <span className="font-normal text-[#64748B]">
                                    · {formatRelativeTime(rep.createdAt)}
                                  </span>
                                </p>
                                <p className="text-xs text-[#E2E8F0] mt-0.5 break-words">
                                  {rep.text}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Owner Viewers + Reactions */}
                    {isOwnStory && (
                      <div className="space-y-2 pt-2 border-t border-[#252D3A]">
                        <p className="text-xs font-semibold text-[#94A3B8]">
                          Viewers &amp; Reactions
                        </p>
                        {viewersList.length === 0 ? (
                          <p className="text-xs text-[#64748B]">
                            No viewers yet in this session.
                          </p>
                        ) : (
                          viewersList.map((viewer) => {
                            const reaction = currentStory.reactions.find(
                              (r) => r.userId === viewer.id
                            );
                            return (
                              <div
                                key={viewer.id}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Avatar
                                    src={viewer.avatar}
                                    name={viewer.fullName}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                      {viewer.fullName}
                                    </p>
                                    <p className="text-xs text-[#64748B] truncate">
                                      @{viewer.username}
                                    </p>
                                  </div>
                                </div>
                                {reaction && (
                                  <span className="text-lg">{reaction.emoji}</span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next story"
            className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-[#141A24] border border-[#252D3A] text-[#F8FAFC] hover:bg-[#1A2230] ml-4 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
