import React from 'react';
import { useApp } from '../context/AppContext';
import { AppRoute } from '../types';
import {
  Home,
  Compass,
  Rss,
  Users,
  Layers,
  Flag,
  MessageSquare,
  Bell,
  Bookmark,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { route, navigate, unreadNotifCount, conversations, logout, currentUser, isLoggedIn } = useApp();
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const mainNav: { label: string; route: AppRoute; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { label: 'Home', route: 'home', icon: Home },
    { label: 'Explore', route: 'explore', icon: Compass },
    { label: 'Messages', route: 'messages', icon: MessageSquare, badge: unreadMessages },
    { label: 'Notifications', route: 'notifications', icon: Bell, badge: unreadNotifCount },
    { label: 'Bookmarks', route: 'bookmarks', icon: Bookmark },
    { label: 'Groups', route: 'groups', icon: Layers },
    { label: 'Profile', route: 'profile', icon: UserIcon },
    { label: 'Settings', route: 'settings', icon: Settings },
  ];

  const secondaryNav: { label: string; route: AppRoute; icon: React.FC<{ className?: string }> }[] = [
    { label: 'News Feed', route: 'feed', icon: Rss },
    { label: 'Network & Friends', route: 'friends', icon: Users },
    { label: 'Insights & Analytics', route: 'insights', icon: BarChart2 },
    { label: 'Help Center', route: 'help', icon: HelpCircle },
  ];

  return (
    <aside className="sticky top-20 hidden md:block md:w-16 lg:w-64 shrink-0 transition-all duration-200">
      <nav className="flex flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md p-2 lg:p-3 shadow-sm transition-colors">
        <div className="hidden lg:block px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Navigation
        </div>

        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = route === item.route;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              title={item.label}
              className={`group relative flex items-center justify-center lg:justify-between rounded-xl p-2.5 lg:px-3.5 lg:py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-semibold border border-[var(--border-accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="relative flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 lg:h-4 lg:w-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] group-hover:text-[var(--text-primary)]'
                  }`}
                />
                <span className="hidden lg:inline">{item.label}</span>
                {/* Tablet mini badge dot */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex lg:hidden h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface)]" />
                )}
              </div>
              {/* Desktop full badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`hidden lg:inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                    isActive ? 'bg-[var(--accent)] text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="my-2 border-t border-[var(--border)]" />

        <div className="hidden lg:block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          More
        </div>

        {secondaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = route === item.route;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              title={item.label}
              className={`group flex items-center justify-center lg:justify-start gap-3 rounded-xl p-2.5 lg:px-3.5 lg:py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-semibold border border-[var(--border-accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon
                className={`h-5 w-5 lg:h-4 lg:w-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] group-hover:text-[var(--text-primary)]'
                }`}
              />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={logout}
          title="Logout"
          className="flex items-center justify-center lg:justify-start gap-3 rounded-xl p-2.5 lg:px-3.5 lg:py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all mt-1 cursor-pointer"
        >
          <LogOut className="h-5 w-5 lg:h-4 lg:w-4" />
          <span className="hidden lg:inline">Logout</span>
        </button>

        {/* User Card */}
        {isLoggedIn && (
          <div
            onClick={() => navigate('profile')}
            className="mt-2 p-1.5 lg:p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-center lg:justify-start gap-2.5 cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-colors"
            title={currentUser.name}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-indigo-400 shrink-0"
            />
            <div className="min-w-0 flex-1 hidden lg:block">
              <div className="text-xs font-bold text-[var(--text)] truncate">{currentUser.name}</div>
              <div className="text-[11px] text-[var(--muted)] font-medium">
                @{currentUser.username}
              </div>
            </div>
          </div>
        )}

        {/* Pro Tip Card - Desktop Only */}
        <div className="mt-3 rounded-xl bg-[var(--surface-secondary)] p-3.5 border border-[var(--border)] hidden lg:block">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nexora Pulse</span>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            Connect with 4 new engineers in your area to expand your technical network.
          </p>
        </div>
      </nav>
    </aside>
  );
};
