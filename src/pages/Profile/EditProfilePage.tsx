import { ArrowLeft, Camera, CheckCircle2, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaImage } from '../../components/common/MediaResolver';
import { AppShell } from '../../components/layout/AppShell';
import { useNexora } from '../../context/NexoraContext';
import { saveMediaFile, validateMediaFile } from '../../services/mediaDB';

export function EditProfilePage() {
  const { currentUser, updateProfile, isUsernameAvailable, addToast } = useNexora();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [coverImage, setCoverImage] = useState(currentUser?.coverImage || '');
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<'avatar' | 'cover' | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) return null;

  const usernameValid =
    username.trim().length >= 3 && /^[a-zA-Z0-9._]+$/.test(username.trim());
  const usernameAvailable = usernameValid
    ? isUsernameAvailable(username, currentUser.id)
    : false;

  const handleUpload = async (
    files: FileList | null,
    target: 'avatar' | 'cover'
  ) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validation = validateMediaFile(file, 'image');
    if (!validation.valid) {
      addToast({ type: 'error', title: validation.error || 'Invalid image' });
      return;
    }

    setUploadingField(target);
    try {
      const uri = await saveMediaFile(file);
      if (target === 'avatar') setAvatar(uri);
      else setCoverImage(uri);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Image save failed',
        description: err instanceof Error ? err.message : 'Storage limit reached',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    if (!usernameValid) {
      setError('Username must be at least 3 characters (letters, numbers, dots, underscores).');
      return;
    }

    const res = updateProfile({
      fullName,
      username,
      bio,
      location,
      website,
      avatar,
      coverImage,
    });
    if (!res.ok) {
      setError(res.error || 'Could not update profile.');
      return;
    }
    navigate('/profile');
  };

  return (
    <AppShell pageTitle="Edit Profile">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="min-w-[38px] min-h-[38px] rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] flex items-center justify-center text-slate-700 dark:text-[#F8FAFC]"
            aria-label="Back to profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Edit Profile
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Changes are saved locally in your browser.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-hidden"
        >
          {/* Cover Upload Preview */}
          <div className="relative h-36 sm:h-44 w-full bg-[#0E121A]">
            <MediaImage
              src={coverImage}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files, 'cover')}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingField === 'cover'}
              className="absolute right-3 bottom-3 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-medium inline-flex items-center gap-1.5 hover:bg-black/85"
            >
              <Camera className="w-3.5 h-3.5" />
              {uploadingField === 'cover' ? 'Saving...' : 'Change Cover'}
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Avatar Upload Preview */}
            <div className="flex items-center gap-4 -mt-12">
              <div className="relative w-20 h-20 rounded-full border-4 border-white dark:border-[#141A24] overflow-hidden bg-[#1A2230]">
                <MediaImage
                  src={avatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files, 'avatar')}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingField === 'avatar'}
                  aria-label="Change profile picture"
                  className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="mt-8 text-xs font-semibold text-[#06B6D4] hover:underline"
              >
                {uploadingField === 'avatar' ? 'Uploading...' : 'Update profile photo'}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-3.5 py-2.5 text-xs text-[#FCA5A5]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={50}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={24}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
                {usernameValid && (
                  <p
                    className={`mt-1 text-[11px] flex items-center gap-1 ${
                      usernameAvailable ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}
                  >
                    {usernameAvailable ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Already in use
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-1.5">
                Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={240}
                className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-1.5">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.dev"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#252D3A] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#94A3B8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
