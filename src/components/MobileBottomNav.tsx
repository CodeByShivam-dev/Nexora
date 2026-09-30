import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Search, Plus, MessageSquare, User as UserIcon } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenCreateModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCreateModal }) => {
  const { route, navigate, conversations, isLoggedIn } = useApp();
  if (!isLoggedIn) return null;

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl px-3 py-1.5 shadow-xl transition-colors pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => navigate('home')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            route === 'home' || route === 'feed'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text-primary)]'
          }`}
          aria-label="Home"
        >
          <Home className="h-5 w-5 transition-transform active:scale-90" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          {(route === 'home' || route === 'feed') && (
            <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--accent)]" />
          )}
        </button>

        <button
          onClick={() => navigate('search')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            route === 'search'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text-primary)]'
          }`}
          aria-label="Search"
        >
          <Search className="h-5 w-5 transition-transform active:scale-90" />
          <span className="text-[10px] mt-0.5 tracking-tight">Search</span>
          {route === 'search' && (
            <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--accent)]" />
          )}
        </button>

        {/* Center Floating Create Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex h-12 w-12 -mt-4 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer ring-4 ring-[var(--surface)]"
          aria-label="Create Post"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => navigate('messages')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            route === 'messages'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text-primary)]'
          }`}
          aria-label="Messages"
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5 transition-transform active:scale-90" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white tabular-nums ring-1 ring-[var(--surface)]">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Messages</span>
          {route === 'messages' && (
            <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--accent)]" />
          )}
        </button>

        <button
          onClick={() => navigate('profile')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            route === 'profile'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text-primary)]'
          }`}
          aria-label="Profile"
        >
          <UserIcon className="h-5 w-5 transition-transform active:scale-90" />
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
          {route === 'profile' && (
            <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--accent)]" />
          )}
        </button>
      </div>
    </nav>
  );
};
