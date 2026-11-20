import {
  AtSign,
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  Sparkles,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { AppShell } from '../../components/layout/AppShell';
import { useNexora } from '../../context/NexoraContext';
import { AppNotification, NotificationType } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

export function NotificationsPage() {
  const {
    userNotifications,
    unreadNotificationCount,
    getUserById,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useNexora();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const items =
    filter === 'unread'
      ? userNotifications.filter((n) => !n.read)
      : userNotifications;

  const getMeta = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE:
        return { icon: Heart, color: 'text-[#EF4444]', label: 'liked your post' };
      case NotificationType.COMMENT:
        return {
          icon: MessageCircle,
          color: 'text-[#06B6D4]',
          label: 'commented on your post',
        };
      case NotificationType.FOLLOW:
        return { icon: UserPlus, color: 'text-[#8B5CF6]', label: 'started following you' };
      case NotificationType.MENTION:
        return { icon: AtSign, color: 'text-[#22C55E]', label: 'mentioned you in a post' };
      case NotificationType.STORY_REPLY:
        return { icon: Sparkles, color: 'text-[#06B6D4]', label: 'replied to your story' };
    }
  };

  const handleOpenNotification = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    const actor = getUserById(notif.actorId);
    if (notif.postId) {
      navigate(`/explore?post=${notif.postId}`);
    } else if (actor) {
      navigate(`/profile/${actor.username}`);
    }
  };

  return (
    <AppShell pageTitle="Notifications">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Notifications
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              {unreadNotificationCount > 0
                ? `${unreadNotificationCount} unread activity updates`
                : 'You are caught up on local activity.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] text-slate-700 dark:text-[#F8FAFC] hover:border-[#06B6D4] inline-flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-[#06B6D4]" />
                Mark all read
              </button>
            )}
            {userNotifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] text-slate-600 dark:text-[#94A3B8] hover:text-[#EF4444] inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'all'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-slate-600 dark:text-[#94A3B8]'
            }`}
          >
            All ({userNotifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'unread'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-slate-600 dark:text-[#94A3B8]'
            }`}
          >
            Unread ({unreadNotificationCount})
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description="Interactions like likes, comments, follows, mentions, and story replies appear here."
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] divide-y divide-slate-100 dark:divide-[#252D3A] overflow-hidden">
            {items.map((notif) => {
              const actor = getUserById(notif.actorId);
              const meta = getMeta(notif.type);
              const Icon = meta.icon;

              return (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                    !notif.read
                      ? 'bg-[#8B5CF6]/[0.06]'
                      : 'hover:bg-slate-50 dark:hover:bg-[#1A2230]/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenNotification(notif)}
                    className="flex items-start gap-3 text-left min-w-0 flex-1"
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        src={actor?.avatar}
                        name={actor?.fullName || 'Creator'}
                        size="md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#141A24] border border-slate-200 dark:border-[#252D3A] flex items-center justify-center">
                        <Icon className={`w-3 h-3 ${meta.color}`} />
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p className="text-sm text-slate-800 dark:text-[#F8FAFC] leading-snug">
                        <span className="font-semibold">
                          {actor?.fullName || 'Someone'}
                        </span>{' '}
                        <span className="text-slate-600 dark:text-[#94A3B8]">
                          {meta.label}
                        </span>
                      </p>
                      {notif.previewText && (
                        <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
                          “{notif.previewText}”
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 dark:text-[#64748B]">
                        {formatRelativeTime(notif.createdAt)}
                      </p>
                    </div>
                  </button>

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-xs font-medium text-[#06B6D4] hover:underline shrink-0 py-1"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
