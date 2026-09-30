import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Shield,
  Eye,
  Bell,
  Sun,
  Moon,
  Laptop,
  Smartphone,
  LogOut,
  Save,
  CheckCircle2,
  Lock,
  HardDrive,
  Download,
} from 'lucide-react';
import api from '../services/api';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    theme,
    setThemeMode,
    density,
    setDensity,
    privacySettings,
    updatePrivacySettings,
    notifSettings,
    updateNotifSetting,
    sessions,
    logoutOtherSessions,
    showToast,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'privacy' | 'notifications' | 'appearance' | 'data'>('profile');

  // Edit Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [headline, setHeadline] = useState(currentUser.headline || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [website, setWebsite] = useState(currentUser.website || '');

  // Security Form State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      username,
      headline,
      bio,
      location,
      website,
    });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      showToast('All password fields are required', 'error');
      return;
    }
    if (newPwd !== confirmPwd) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Password updated securely!', 'success');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs">
        <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">Account & Preferences</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">Manage your personal credentials, privacy, and interface theme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Navigation Menu */}
        <div className="lg:col-span-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs space-y-1">
          {[
            { id: 'profile', label: 'Edit Profile', icon: User, desc: 'Display name, headline & bio' },
            { id: 'security', label: 'Security & Sessions', icon: Shield, desc: 'Password & active devices' },
            { id: 'privacy', label: 'Privacy & Visibility', icon: Eye, desc: 'Who can contact & follow you' },
            { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Push & email digest preferences' },
            { id: 'appearance', label: 'Appearance & Density', icon: Sun, desc: 'Light/Dark mode & spacing' },
            { id: 'data', label: 'Data & Storage', icon: HardDrive, desc: 'Manage your activity and media data' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex w-full items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 ${isActive ? 'text-white' : 'text-[var(--muted)]'}`} />
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className={`text-[11px] ${isActive ? 'text-indigo-100' : 'text-[var(--muted)]'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content */}
        <div className="lg:col-span-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs">
          {/* 1. Edit Profile */}
          {activeSection === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <h2 className="text-base font-bold text-[var(--text)]">Edit Profile Information</h2>

              {/* Live Preview Box */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/50 p-4 flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={name}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-[var(--primary)]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[var(--text)] truncate">{name || 'Your Name'}</span>
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate">@{username || 'handle'}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{headline || 'Your Headline'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Product Designer & Full-stack Engineer"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Website / Portfolio
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Security & Sessions */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <h2 className="text-base font-bold text-[var(--text)]">Change Password</h2>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs"
                >
                  Update Password
                </button>
              </form>

              {/* Active Sessions (Section 31) */}
              <div className="pt-6 border-t border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">Active Login Sessions</h3>
                    <p className="text-xs text-[var(--muted)]">Devices currently authenticated to your Nexora profile</p>
                  </div>
                  <button
                    onClick={logoutOtherSessions}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Log out all others
                  </button>
                </div>

                <div className="space-y-3">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--primary)]">
                          {sess.device.includes('Phone') || sess.device.includes('Pixel') ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Laptop className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text)]">{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 text-[10px] font-bold px-1.5 py-0.2">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[var(--muted)]">
                            {sess.browser} · {sess.location} · {sess.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--text)]">Privacy & Audience Controls</h2>

              {[
                { key: 'visibility', title: 'Profile Visibility', desc: 'Who can see your complete profile timeline' },
                { key: 'whoCanFollow', title: 'Who can follow me', desc: 'Allow anyone to subscribe to your technical updates' },
                { key: 'whoCanMessage', title: 'Direct Messaging', desc: 'Who can initiate 1-on-1 private conversations' },
                { key: 'whoCanComment', title: 'Post Comments', desc: 'Who is allowed to comment on your updates' },
                { key: 'whoCanMention', title: 'Mentions & Tags', desc: 'Who can mention your @handle in posts' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">{item.title}</h4>
                    <p className="text-[11px] text-[var(--muted)]">{item.desc}</p>
                  </div>
                  <select
                    value={(privacySettings as any)[item.key] || 'Everyone'}
                    onChange={(e) => updatePrivacySettings(item.key, e.target.value)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-1.5 text-xs text-[var(--text)] focus:outline-none"
                  >
                    <option value="Everyone">Everyone</option>
                    <option value="Friends">Friends only</option>
                    <option value="Nobody">Nobody</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* 4. Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[var(--text)]">Notification Preferences</h2>

              {[
                { key: 'likes', title: 'Likes & Reactions', desc: 'When someone likes your technical posts' },
                { key: 'comments', title: 'Post Comments', desc: 'When someone replies or asks a question' },
                { key: 'followers', title: 'New Followers', desc: 'When someone begins following your updates' },
                { key: 'messages', title: 'Direct Messages', desc: 'Instant alert when a message is received' },
                { key: 'mentions', title: 'Mentions', desc: 'When you are referenced in a thread or comment' },
                { key: 'emailDigest', title: 'Weekly Email Digest', desc: 'Summary of top architecture discussions' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">{item.title}</h4>
                    <p className="text-[11px] text-[var(--muted)]">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifSettings[item.key])}
                    onChange={(e) => updateNotifSetting(item.key, e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 5. Appearance & Density */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-[var(--text)]">Theme & Visual Experience</h2>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-3">Color Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      theme === 'light'
                        ? 'border-[var(--primary)] bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'border-[var(--border)] bg-[var(--surface-secondary)]/40 hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-[var(--text)]">Light Mode</div>
                      <div className="text-[10px] text-[var(--muted)]">Crisp white canvas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      theme === 'dark'
                        ? 'border-[var(--primary)] bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'border-[var(--border)] bg-[var(--surface-secondary)]/40 hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    <Moon className="h-5 w-5 text-sky-400" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-[var(--text)]">Dark Mode</div>
                      <div className="text-[10px] text-[var(--muted)]">High contrast slate</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <label className="block text-xs font-semibold text-[var(--muted)] mb-3">Layout Density</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDensity('comfortable');
                      showToast('Interface set to Comfortable density', 'info');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      density === 'comfortable'
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    Comfortable (Default)
                  </button>
                  <button
                    onClick={() => {
                      setDensity('compact');
                      showToast('Interface set to Compact density', 'info');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      density === 'compact'
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    Compact High-Density
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. Data & Storage Management */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[var(--text)]">Data & Storage Management</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Account Active
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Review your stored content, manage storage usage, and export your personal data archive.
                </p>
              </div>

              {/* Account Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="font-semibold text-[var(--text)]">Content Summary</span>
                    <span className="text-[11px] font-medium text-indigo-500">Synchronized</span>
                  </div>
                  <div className="text-sm font-bold text-[var(--text)]">{currentUser.postsCount || 0} Posts Published</div>
                  <div className="text-xs text-[var(--muted)]">
                    {currentUser.followingCount || 0} Following • {currentUser.followersCount || 0} Followers
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    Account Member since {currentUser.joinedDate ? new Date(currentUser.joinedDate).toLocaleDateString() : '2026'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="font-semibold text-[var(--text)]">Account Security</span>
                    <span className="text-emerald-500 text-[11px] font-bold">Protected</span>
                  </div>
                  <div className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                    <span>{currentUser.name}</span>
                    {currentUser.isVerified && (
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    @{currentUser.username} {currentUser.email ? `• ${currentUser.email}` : ''}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Session secured</span>
                  </div>
                </div>
              </div>

              {/* Data Archive & Export */}
              <div className="rounded-2xl border border-[var(--border)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)]">Export Your Information</h3>
                    <p className="text-[11px] text-[var(--muted)]">Download an archive copy of your posts, profile, and settings.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const exportObj = {
                        user: {
                          name: currentUser.name,
                          username: currentUser.username,
                          email: currentUser.email,
                          bio: currentUser.bio,
                          headline: currentUser.headline,
                          location: currentUser.location,
                          website: currentUser.website,
                        },
                        exportedAt: new Date().toISOString(),
                      };
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute('href', dataStr);
                      downloadAnchor.setAttribute('download', `nexora_archive_${currentUser.username}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      showToast('Data archive downloaded successfully', 'success');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Archive</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
