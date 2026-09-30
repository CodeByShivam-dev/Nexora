import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  ShieldAlert,
  CheckCheck,
  Check,
  Sparkles,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotifCount,
    navigate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'mentions'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'mentions') return n.type === 'mention' || n.type === 'comment';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-sky-500" />;
      case 'follow':
      case 'follow_request':
        return <UserPlus className="h-4 w-4 text-[var(--primary)]" />;
      case 'group':
        return <Users className="h-4 w-4 text-indigo-500" />;
      case 'system':
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-[var(--primary)]" />;
    }
  };

  const getNotificationText = (n: typeof notifications[0]) => {
    switch (n.type) {
      case 'like':
        return `liked your ${n.targetTitle || 'post'}.`;
      case 'comment':
        return `commented on your ${n.targetTitle || 'post'}.`;
      case 'follow':
        return `started following you.`;
      case 'group':
        return `invited you to join a technical guild.`;
      case 'system':
        return n.targetTitle || `security notification regarding your account.`;
      default:
        return `interacted with your profile.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
              Notifications
            </h1>
            {unreadNotifCount > 0 && (
              <span className="rounded-full bg-rose-500 text-white px-2 py-0.5 text-xs font-bold tabular-nums">
                {unreadNotifCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">Stay updated with mentions, reactions, and network updates.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadNotifCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] transition-all"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl">
            {(['all', 'unread', 'mentions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                notif.isRead
                  ? 'border-[var(--border)] bg-[var(--surface)] opacity-85 hover:opacity-100'
                  : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={notif.actor.avatar}
                    alt={notif.actor.name}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--border)]"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface)] shadow-xs ring-1 ring-[var(--border)]">
                    {getIcon(notif.type)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[var(--text)] leading-snug">
                    <strong className="font-bold text-[var(--text)]">{notif.actor.name}</strong>{' '}
                    <span className="text-[var(--text-secondary)]">{getNotificationText(notif)}</span>
                  </p>
                  <span className="text-[11px] text-[var(--muted)] tabular-nums mt-1 block">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <div className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--muted)]">
            <Bell className="mx-auto h-8 w-8 text-[var(--muted)] mb-2" />
            <p>No notifications matching this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
