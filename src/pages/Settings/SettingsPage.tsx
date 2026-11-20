import {
  Bell,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { useNexora } from '../../context/NexoraContext';
import { StoryPrivacy } from '../../types';

export function SettingsPage() {
  const {
    currentUser,
    settings,
    updateSettings,
    changePasswordDemo,
    resetDemoData,
    logout,
  } = useNexora();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!currentUser) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword.length < 8) {
      setPwMessage({ type: 'err', text: 'New password must be at least 8 characters.' });
      return;
    }
    const res = changePasswordDemo(currentPassword, newPassword);
    if (!res.ok) {
      setPwMessage({ type: 'err', text: res.error || 'Could not update password.' });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setPwMessage({ type: 'ok', text: 'Local demo password updated.' });
  };

  return (
    <AppShell pageTitle="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            Settings &amp; Preferences
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
            Manage appearance, local privacy defaults, notifications, and demo storage.
          </p>
        </div>

        {/* Account Summary */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {currentUser.fullName} (@{currentUser.username})
              </p>
              <p className="text-xs text-slate-500 dark:text-[#64748B]">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile/edit')}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#252D3A] hover:border-[#8B5CF6] transition-colors"
          >
            Edit Profile Details
          </button>
        </section>

        {/* Appearance & Language */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 space-y-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Appearance &amp; Localization
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#8B5CF6]" />
              ) : (
                <Sun className="w-4 h-4 text-[#06B6D4]" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                  Theme Mode
                </p>
                <p className="text-xs text-slate-500 dark:text-[#64748B]">
                  Switch between NEXORA Dark (#090B10) and Crisp Light mode
                </p>
              </div>
            </div>
            <div className="inline-flex p-1 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A]">
              <button
                type="button"
                onClick={() => updateSettings((prev) => ({ ...prev, theme: 'dark' }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-slate-600 dark:text-[#94A3B8]'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => updateSettings((prev) => ({ ...prev, theme: 'light' }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-slate-600 dark:text-[#94A3B8]'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-[#252D3A]">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-[#06B6D4]" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                  Interface Language (Preference)
                </p>
                <p className="text-xs text-slate-500 dark:text-[#64748B]">
                  Stored locally for UI preference demonstration
                </p>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) =>
                updateSettings((prev) => ({
                  ...prev,
                  language: e.target.value as 'en' | 'es' | 'de' | 'jp',
                }))
              }
              aria-label="Language preference"
              className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3 py-2 text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="jp">日本語</option>
            </select>
          </div>
        </section>

        {/* Privacy & Story Defaults */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Privacy &amp; Story Audience
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                Default Story Privacy
              </p>
              <p className="text-xs text-slate-500 dark:text-[#64748B]">
                Applies automatically when creating a new story
              </p>
            </div>
            <select
              value={settings.defaultStoryPrivacy}
              onChange={(e) =>
                updateSettings((prev) => ({
                  ...prev,
                  defaultStoryPrivacy: e.target.value as StoryPrivacy,
                }))
              }
              aria-label="Default story privacy"
              className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3 py-2 text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
            >
              <option value={StoryPrivacy.PUBLIC}>Public</option>
              <option value={StoryPrivacy.FOLLOWERS}>Followers only</option>
              <option value={StoryPrivacy.CLOSE_FRIENDS}>Close Friends</option>
            </select>
          </div>

          <label className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#252D3A] cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                Private Account Mode
              </p>
              <p className="text-xs text-slate-500 dark:text-[#64748B]">
                Local preference flag indicating follower-approved visibility
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.privateProfile}
              onChange={(e) =>
                updateSettings((prev) => ({
                  ...prev,
                  privateProfile: e.target.checked,
                }))
              }
              className="w-4 h-4 accent-[#8B5CF6]"
            />
          </label>
        </section>

        {/* Notification Preferences */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { key: 'likes' as const, label: 'Post likes' },
              { key: 'comments' as const, label: 'Comments & replies' },
              { key: 'follows' as const, label: 'New followers' },
              { key: 'mentions' as const, label: '@Mentions' },
              { key: 'storyReplies' as const, label: 'Story reactions & replies' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between gap-3 py-1 cursor-pointer"
              >
                <span className="text-sm text-slate-700 dark:text-[#E2E8F0]">
                  {item.label}
                </span>
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={(e) =>
                    updateSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [item.key]: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-[#8B5CF6]"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Change Password Demo */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Change Password (Local Demo)
            </h2>
          </div>

          {pwMessage && (
            <p
              className={`text-xs font-medium ${
                pwMessage.type === 'ok' ? 'text-[#22C55E]' : 'text-[#EF4444]'
              }`}
            >
              {pwMessage.text}
            </p>
          )}

          <form
            onSubmit={handlePasswordChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (8+ chars)"
              className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
              >
                Update Local Password
              </button>
            </div>
          </form>
        </section>

        {/* Data & Session Actions */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#F8FAFC] hover:border-[#06B6D4] inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-[#06B6D4]" />
            Reset Demo Data
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/25 inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </section>
      </div>

      <ConfirmModal
        open={confirmResetOpen}
        title="Reset all local demo data?"
        description="This clears any posts, stories, uploaded media, messages, and profile edits saved in this browser and restores the original NEXORA sample dataset."
        confirmLabel="Restore Demo Data"
        danger
        onConfirm={() => {
          resetDemoData();
        }}
        onClose={() => setConfirmResetOpen(false)}
      />
    </AppShell>
  );
}
