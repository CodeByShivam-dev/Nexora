import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PostPrivacy } from '../types';
import api from '../services/api';
import {
  Image as ImageIcon,
  Smile,
  MapPin,
  Globe,
  Users,
  Lock,
  Send,
  X,
  Sparkles,
  Upload,
} from 'lucide-react';

interface PostComposerProps {
  onPostSuccess?: () => void;
  compact?: boolean;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onPostSuccess, compact }) => {
  const { currentUser, createPost, showToast } = useApp();
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PostPrivacy>('public');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [feeling, setFeeling] = useState<string>('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    { label: 'Workspace', url: '/src/assets/images/post_photo_tech_1790446531677.jpg' },
    { label: 'Community', url: '/src/assets/images/group_banner_dev_1790446548511.jpg' },
    { label: 'Preview', url: '/src/assets/images/hero_social_preview_1790446483047.jpg' },
  ];

  const feelings = ['🚀 Inspired', '💡 Optimistic', '☕ Productive', '💻 Focused', '🎉 Celebrating'];

  // Handle local device image upload with resilient instant preview & fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Read immediately via FileReader so image is attached with 0ms delay and local resilience
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const res = await api.uploadFile(file);
      if (res.status === 200 && res.data?.mediaUrl) {
        setSelectedImage(res.data.mediaUrl);
        showToast('Photo attached successfully!', 'success');
      } else {
        showToast('Photo attached!', 'success');
      }
    } catch (_) {
      // Data URL fallback remains in selectedImage, guaranteeing successful post
      showToast('Photo attached!', 'info');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    // extract hashtags automatically
    const extractedHashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []).map((h) => h.replace('#', ''));

    createPost(content, {
      mediaUrl: selectedImage || undefined,
      privacy,
      feeling: feeling || undefined,
      location: location || undefined,
      hashtags: extractedHashtags,
    });

    setContent('');
    setSelectedImage(null);
    setLocation('');
    setFeeling('');
    setShowLocationInput(false);
    setShowFeelingSelector(false);
    if (onPostSuccess) onPostSuccess();
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-all">
      {/* Hidden file input for phone / desktop device photos (Section 16) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
            }}
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your engineering breakthrough, design insight, or question..."
              rows={compact ? 2 : 3}
              className="w-full resize-none bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none leading-relaxed"
            />

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="relative mt-2 inline-block rounded-xl overflow-hidden border border-[var(--border)]">
                <img
                  src={selectedImage}
                  alt="Post Attachment"
                  className="max-h-56 w-auto object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-indigo-500 animate-pulse font-medium">
                <div className="h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Uploading device photo...</span>
              </div>
            )}

            {/* Location or Feeling pills */}
            {(location || feeling) && (
              <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-secondary)]">
                {feeling && (
                  <span className="flex items-center gap-1 bg-[var(--surface-secondary)] px-2.5 py-1 rounded-lg">
                    {feeling}
                    <button type="button" onClick={() => setFeeling('')} className="ml-1 text-[var(--muted)] hover:text-[var(--text)]">×</button>
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1 bg-[var(--surface-secondary)] px-2.5 py-1 rounded-lg">
                    <MapPin className="h-3 w-3 text-rose-500" />
                    {location}
                    <button type="button" onClick={() => setLocation('')} className="ml-1 text-[var(--muted)] hover:text-[var(--text)]">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location Input Drawer */}
        {showLocationInput && (
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
            <MapPin className="h-4 w-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Add location (e.g. Bengaluru, India)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 text-xs bg-transparent text-[var(--text)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowLocationInput(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              Done
            </button>
          </div>
        )}

        {/* Feeling Selector Drawer */}
        {showFeelingSelector && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border)]">
            {feelings.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFeeling(f);
                  setShowFeelingSelector(false);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] transition-colors text-[var(--text)]"
              >
                {f}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
          {/* Media Attach Options */}
          <div className="flex items-center gap-1">
            {/* Device photo upload button (Section 16) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-emerald-500 transition-colors"
              title="Upload photo from phone, laptop, or desktop"
            >
              <Upload className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline">Upload Photo</span>
            </button>

            {/* Quick photo presets dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-indigo-500 transition-colors"
              >
                <ImageIcon className="h-4 w-4 text-indigo-500" />
                <span className="hidden sm:inline">Presets</span>
              </button>

              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:flex flex-col gap-1 p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-lg z-20 w-44">
                <span className="text-[10px] font-semibold text-[var(--muted)] uppercase px-1">Preset Samples</span>
                {sampleImages.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] text-left text-xs text-[var(--text)]"
                  >
                    <img src={img.url} alt={img.label} className="h-6 w-6 rounded object-cover" />
                    <span>{img.label} photo</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFeelingSelector(!showFeelingSelector)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-amber-500 transition-colors"
            >
              <Smile className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline">Feeling</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-rose-500 transition-colors"
            >
              <MapPin className="h-4 w-4 text-rose-500" />
              <span className="hidden sm:inline">Location</span>
            </button>
          </div>

          {/* Visibility and Post Button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
                className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] py-1.5 pl-7 pr-6 text-xs font-medium text-[var(--text-secondary)] focus:outline-none cursor-pointer"
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="only_me">Only me</option>
              </select>
              <div className="pointer-events-none absolute left-2 top-2 text-[var(--muted)]">
                {privacy === 'public' && <Globe className="h-3.5 w-3.5" />}
                {privacy === 'friends' && <Users className="h-3.5 w-3.5" />}
                {privacy === 'only_me' && <Lock className="h-3.5 w-3.5" />}
              </div>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !selectedImage) || isUploading}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
