import { AnimatePresence, motion } from 'motion/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Eye,
  Film,
  ImagePlus,
  Lock,
  Maximize2,
  Minimize2,
  PenLine,
  Smile,
  Trash2,
  Type,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { saveMediaFile, validateMediaFile } from '../../services/mediaDB';
import { StoryPrivacy } from '../../types';
import { MediaImage, MediaVideo } from '../common/MediaResolver';
import { NexoraLogo } from '../common/NexoraLogo';

const BG_PRESETS = [
  { name: 'Violet Pulse', css: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 45%, #0E7490 100%)' },
  { name: 'Midnight Slate', css: 'linear-gradient(135deg, #090B10 0%, #1E293B 60%, #0F172A 100%)' },
  { name: 'Cyan Horizon', css: 'linear-gradient(135deg, #083344 0%, #0E7490 50%, #312E81 100%)' },
  { name: 'Crimson Dusk', css: 'linear-gradient(135deg, #450A0A 0%, #7C2D12 50%, #1E1B4B 100%)' },
  { name: 'Emerald Deep', css: 'linear-gradient(135deg, #022C22 0%, #065F46 50%, #0F172A 100%)' },
];

const STORY_EMOJIS = ['❤️', '😂', '🔥', '😍', '👏', '😮', '✨', '🚀'];

export function CreateStoryModal() {
  const {
    currentUser,
    isCreateStoryOpen,
    setCreateStoryOpen,
    createStory,
    settings,
    addToast,
  } = useNexora();

  const [mode, setMode] = useState<'image' | 'video' | 'text'>('image');
  const [previewOnly, setPreviewOnly] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | undefined>(undefined);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [videoMuted, setVideoMuted] = useState(true);
  const [textOverlay, setTextOverlay] = useState('');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [caption, setCaption] = useState('');
  const [bgStyle, setBgStyle] = useState(BG_PRESETS[0].css);
  const [privacy, setPrivacy] = useState<StoryPrivacy>(settings.defaultStoryPrivacy);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) return null;

  const resetForm = () => {
    setMode('image');
    setPreviewOnly(false);
    setMediaUri(undefined);
    setImageFit('cover');
    setVideoMuted(true);
    setTextOverlay('');
    setTextAlign('center');
    setTextSize('md');
    setCaption('');
    setBgStyle(BG_PRESETS[0].css);
    setPrivacy(settings.defaultStoryPrivacy);
  };

  const handleClose = () => {
    resetForm();
    setCreateStoryOpen(false);
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validation = validateMediaFile(file, 'any');
    if (!validation.valid || !validation.mediaType) {
      addToast({ type: 'error', title: validation.error || 'Unsupported file' });
      return;
    }

    setUploading(true);
    try {
      const uri = await saveMediaFile(file);
      setMediaUri(uri);
      setMode(validation.mediaType);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Could not save media locally',
        description: err instanceof Error ? err.message : 'Storage quota error',
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && !textOverlay.trim()) {
      addToast({ type: 'error', title: 'Write a message for your text story.' });
      return;
    }
    if ((mode === 'image' || mode === 'video') && !mediaUri) {
      addToast({ type: 'error', title: 'Upload media or switch to Text Story mode.' });
      return;
    }

    createStory({
      mediaType: mode,
      mediaUrl: mode === 'text' ? undefined : mediaUri,
      imageFit,
      textOverlay: textOverlay.trim() || undefined,
      textAlign,
      textSize,
      caption: caption.trim() || undefined,
      backgroundStyle: mode === 'text' ? bgStyle : undefined,
      privacy,
    });
    handleClose();
  };

  const textSizeClass =
    textSize === 'sm' ? 'text-base' : textSize === 'lg' ? 'text-3xl' : 'text-xl';
  const textAlignClass =
    textAlign === 'left'
      ? 'text-left'
      : textAlign === 'right'
      ? 'text-right'
      : 'text-center';

  return (
    <AnimatePresence>
      {isCreateStoryOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Story Creator"
            className="relative z-10 w-full h-full sm:h-auto sm:max-h-[94vh] max-w-4xl flex flex-col sm:rounded-2xl border-0 sm:border sm:border-[#252D3A] bg-[#090B10] text-[#F8FAFC] shadow-2xl overflow-hidden"
          >
            {/* Top Bar: Close, Branding, Draft/Preview Toggle */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-[#252D3A] bg-[#0E121A] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-w-[38px] min-h-[38px] rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#1A2230] flex items-center justify-center"
                  aria-label="Close story creator"
                >
                  <X className="w-5 h-5" />
                </button>
                <NexoraLogo size="sm" />
                <span className="hidden sm:inline text-xs text-[#64748B]">
                  · Story Studio
                </span>
              </div>

              <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-[#252D3A] bg-[#090B10]">
                <button
                  type="button"
                  onClick={() => setPreviewOnly(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    !previewOnly ? 'bg-[#8B5CF6] text-white' : 'text-[#94A3B8]'
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOnly(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    previewOnly ? 'bg-[#06B6D4] text-[#090B10]' : 'text-[#94A3B8]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
            </div>

            {/* Body: Center 9:16 Canvas + Editor Tools */}
            <form
              onSubmit={handlePublish}
              className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Vertical 9:16 Canvas */}
              <div
                className={`${
                  previewOnly ? 'lg:col-span-12' : 'lg:col-span-5'
                } flex flex-col items-center`}
              >
                <div
                  className="relative w-full max-w-[290px] aspect-[9/16] rounded-2xl border border-[#252D3A] overflow-hidden bg-[#0E121A] flex items-center justify-center shadow-2xl"
                  style={mode === 'text' ? { background: bgStyle } : undefined}
                >
                  {mode === 'image' && mediaUri && (
                    <MediaImage
                      src={mediaUri}
                      alt="Story preview"
                      className={`w-full h-full ${
                        imageFit === 'contain' ? 'object-contain' : 'object-cover'
                      }`}
                    />
                  )}
                  {mode === 'video' && mediaUri && (
                    <MediaVideo
                      src={mediaUri}
                      muted={videoMuted}
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    />
                  )}
                  {(mode === 'image' || mode === 'video') && !mediaUri && (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#141A24] border border-[#252D3A] mx-auto flex items-center justify-center text-[#06B6D4]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-[#F8FAFC]">
                        9:16 Story Canvas
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Upload an image or short video from your device
                      </p>
                    </div>
                  )}

                  {/* Canvas Overlay Controls for Media */}
                  {mediaUri && mode !== 'text' && !previewOnly && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      {mode === 'image' && (
                        <button
                          type="button"
                          onClick={() =>
                            setImageFit((f) => (f === 'cover' ? 'contain' : 'cover'))
                          }
                          title={imageFit === 'cover' ? 'Fit entire image' : 'Fill frame'}
                          className="w-8 h-8 rounded-full bg-black/65 text-white hover:bg-black/85 flex items-center justify-center"
                        >
                          {imageFit === 'cover' ? (
                            <Minimize2 className="w-4 h-4" />
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {mode === 'video' && (
                        <button
                          type="button"
                          onClick={() => setVideoMuted((m) => !m)}
                          title={videoMuted ? 'Unmute preview' : 'Mute preview'}
                          className="w-8 h-8 rounded-full bg-black/65 text-white hover:bg-black/85 flex items-center justify-center"
                        >
                          {videoMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setMediaUri(undefined)}
                        title="Remove selected media"
                        className="w-8 h-8 rounded-full bg-black/65 text-[#FCA5A5] hover:bg-[#EF4444] hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Text Overlay */}
                  {textOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                      <p
                        className={`w-full font-display font-bold text-white leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] break-words ${textSizeClass} ${textAlignClass}`}
                      >
                        {textOverlay}
                      </p>
                    </div>
                  )}

                  {/* Bottom Caption Scrim */}
                  {caption && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
                      <p className="text-xs text-[#F8FAFC] leading-relaxed break-words">
                        {caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor Tools Panel */}
              {!previewOnly && (
                <div className="lg:col-span-7 space-y-5">
                  {/* Story Type Selector */}
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                      Story Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setMode('image')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                          mode === 'image'
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white'
                            : 'border-[#252D3A] bg-[#141A24] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <ImagePlus className="w-4 h-4 text-[#06B6D4]" />
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('video')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                          mode === 'video'
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white'
                            : 'border-[#252D3A] bg-[#141A24] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Film className="w-4 h-4 text-[#8B5CF6]" />
                        Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('text')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                          mode === 'text'
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white'
                            : 'border-[#252D3A] bg-[#141A24] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Type className="w-4 h-4 text-[#22C55E]" />
                        Text
                      </button>
                    </div>
                  </div>

                  {/* Gallery Upload */}
                  {mode !== 'text' && (
                    <div className="space-y-2">
                      <input
                        ref={fileRef}
                        type="file"
                        accept={
                          mode === 'image'
                            ? 'image/jpeg,image/png,image/webp,image/gif'
                            : 'video/mp4,video/webm,video/quicktime'
                        }
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                      />
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="flex-1 py-3 px-4 rounded-xl border border-dashed border-[#364152] bg-[#141A24] hover:border-[#8B5CF6] text-sm font-medium text-[#F8FAFC] flex items-center justify-center gap-2 transition-colors"
                        >
                          <Upload className="w-4 h-4 text-[#06B6D4]" />
                          {uploading
                            ? 'Saving to IndexedDB...'
                            : mediaUri
                            ? 'Replace Media'
                            : `Upload ${mode === 'image' ? 'Image' : 'Video'}`}
                        </button>
                        {mediaUri && (
                          <button
                            type="button"
                            onClick={() => setMediaUri(undefined)}
                            className="py-3 px-4 rounded-xl border border-[#252D3A] bg-[#141A24] text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        {mode === 'image'
                          ? 'JPEG, PNG, WebP, GIF up to 5 MB · Toggle Cover/Contain fit on canvas'
                          : 'MP4, WebM, MOV up to 18 MB · Stored locally via IndexedDB'}
                      </p>
                    </div>
                  )}

                  {/* Background Selection for Text Story */}
                  {mode === 'text' && (
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                        Background Color
                      </label>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {BG_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setBgStyle(preset.css)}
                            title={preset.name}
                            className={`w-10 h-10 rounded-xl border-2 transition-transform ${
                              bgStyle === preset.css
                                ? 'border-white scale-105'
                                : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                            style={{ background: preset.css }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text Tool + Alignment + Size */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[#94A3B8]">
                        {mode === 'text' ? 'Story Message' : 'Text Overlay (optional)'}
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-[#252D3A] bg-[#141A24] p-0.5">
                          <button
                            type="button"
                            onClick={() => setTextAlign('left')}
                            aria-label="Align left"
                            className={`p-1.5 rounded-md ${
                              textAlign === 'left'
                                ? 'bg-[#8B5CF6] text-white'
                                : 'text-[#94A3B8]'
                            }`}
                          >
                            <AlignLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextAlign('center')}
                            aria-label="Align center"
                            className={`p-1.5 rounded-md ${
                              textAlign === 'center'
                                ? 'bg-[#8B5CF6] text-white'
                                : 'text-[#94A3B8]'
                            }`}
                          >
                            <AlignCenter className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextAlign('right')}
                            aria-label="Align right"
                            className={`p-1.5 rounded-md ${
                              textAlign === 'right'
                                ? 'bg-[#8B5CF6] text-white'
                                : 'text-[#94A3B8]'
                            }`}
                          >
                            <AlignRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="inline-flex rounded-lg border border-[#252D3A] bg-[#141A24] p-0.5 text-[11px] font-semibold">
                          {(['sm', 'md', 'lg'] as const).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setTextSize(sz)}
                              className={`px-2 py-1 rounded-md uppercase ${
                                textSize === sz
                                  ? 'bg-[#06B6D4] text-[#090B10]'
                                  : 'text-[#94A3B8]'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      maxLength={180}
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      placeholder="Write text to display on your story..."
                      className="w-full rounded-xl border border-[#252D3A] bg-[#141A24] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>

                  {/* Emoji Tool + Caption */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[#94A3B8]">
                        Caption (optional)
                      </label>
                      <div className="flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-[#94A3B8] mr-1" />
                        {STORY_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() =>
                              setTextOverlay((prev) => (prev + emoji).slice(0, 180))
                            }
                            className="w-7 h-7 rounded-lg hover:bg-[#1A2230] text-sm flex items-center justify-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      maxLength={140}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a bottom caption..."
                      className="w-full rounded-xl border border-[#252D3A] bg-[#141A24] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4]"
                    />
                  </div>

                  {/* Story Privacy */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] mb-2">
                      <Lock className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>Story Audience</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: StoryPrivacy.PUBLIC, label: 'Public' },
                        { value: StoryPrivacy.FOLLOWERS, label: 'Followers' },
                        { value: StoryPrivacy.CLOSE_FRIENDS, label: 'Close Friends' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPrivacy(opt.value)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                            privacy === opt.value
                              ? 'border-[#06B6D4] bg-[#06B6D4]/15 text-[#F8FAFC]'
                              : 'border-[#252D3A] bg-[#141A24] text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="lg:col-span-12 pt-4 border-t border-[#252D3A] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#64748B]">
                  Stories remain active for 24 hours · Can be pinned to Profile Highlights
                </span>
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[#252D3A] text-[#94A3B8] hover:bg-[#1A2230]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                  >
                    Share Story
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
