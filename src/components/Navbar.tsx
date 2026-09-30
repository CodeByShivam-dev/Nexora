import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  User as UserIcon,
  Bookmark,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal }) => {
  const {
    theme,
    toggleTheme,
    currentUser,
    isLoggedIn,
    navigate,
    route,
    unreadNotifCount,
    conversations,
    searchQuery,
    setSearchQuery,
    addSearchHistory,
    logout,
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
      navigate('search');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(isLoggedIn ? 'home' : 'landing')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            aria-label="Nexora Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="font-extrabold tracking-tighter text-lg">N</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[var(--text)]">NEXORA</span>
            </div>
          </button>

          {/* Quick Nav Links on Desktop when Logged In */}
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-1 pl-4 text-sm font-medium text-[var(--muted)]">
              <button
                onClick={() => navigate('feed')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  route === 'feed'
                    ? 'text-[var(--primary)] bg-[var(--primary-light)] font-semibold'
                    : 'hover:text-[var(--text)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => navigate('explore')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  route === 'explore'
                    ? 'text-[var(--primary)] bg-[var(--primary-light)] font-semibold'
                    : 'hover:text-[var(--text)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => navigate('friends')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  route === 'friends'
                    ? 'text-[var(--primary)] bg-[var(--primary-light)] font-semibold'
                    : 'hover:text-[var(--text)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                Network
              </button>
              <button
                onClick={() => navigate('groups')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  route === 'groups'
                    ? 'text-[var(--primary)] bg-[var(--primary-light)] font-semibold'
                    : 'hover:text-[var(--text)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                Groups
              </button>
            </nav>
          )}
        </div>

        {/* Zone 2: Search */}
        {isLoggedIn && (
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-6 relative items-center"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts, engineers, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2 pl-9 pr-4 text-sm text-[var(--text)] placeholder-[var(--muted)] transition-all focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </form>
        )}

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-all cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            )}
          </button>

          {!isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('login')}
                className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('signup')}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-hover)] transition-all"
              >
                Get Started
              </button>
            </div>
          ) : (
            <>
              {/* Create Post Action */}
              <button
                onClick={onOpenCreateModal}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-all"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Create</span>
              </button>

              {/* Messages Trigger */}
              <button
                onClick={() => navigate('messages')}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                aria-label="Messages"
              >
                <MessageSquare className="h-4 w-4" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white tabular-nums">
                    {totalUnreadMessages}
                  </span>
                )}
              </button>

              {/* Notifications Trigger */}
              <button
                onClick={() => navigate('notifications')}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white tabular-nums">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-[var(--surface-secondary)] transition-colors focus:outline-none"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--border)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                    }}
                  />
                  <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-[var(--muted)]" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 border-b border-[var(--border)] px-3 py-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--primary)]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-sm text-[var(--text)]">
                          {currentUser.name}
                        </div>
                        <div className="truncate text-xs text-[var(--muted)]">
                          @{currentUser.username}
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('profile');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-[var(--muted)]" />
                        <span>Your Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('bookmarks');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-[var(--muted)]" />
                        <span>Saved Bookmarks</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('insights');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                      >
                        <BarChart2 className="h-4 w-4 text-[var(--muted)]" />
                        <span>Insights & Analytics</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('settings');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                      >
                        <Settings className="h-4 w-4 text-[var(--muted)]" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('help');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-[var(--muted)]" />
                        <span>Help Center & FAQ</span>
                      </button>
                    </div>

                    <div className="border-t border-[var(--border)] pt-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
