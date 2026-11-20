import {
  Bell,
  Compass,
  Home,
  Menu,
  MessageSquare,
  PlusSquare,
  Search,
  User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { NexoraLogo } from '../common/NexoraLogo';
import { LeftSidebar } from './LeftSidebar';
import { MobileDrawer } from './MobileDrawer';
import { RightSidebar } from './RightSidebar';

interface AppShellProps {
  children: React.ReactNode;
  hideRightSidebar?: boolean;
  pageTitle?: string;
}

export function AppShell({
  children,
  hideRightSidebar = false,
  pageTitle,
}: AppShellProps) {
  const { unreadNotificationCount, setCreatePostOpen } = useNexora();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090B10] text-slate-900 dark:text-[#F8FAFC]">
      {/* Mobile Compact Header (52px height) */}
      <header className="lg:hidden sticky top-0 z-40 h-[52px] px-4 flex items-center justify-between border-b border-slate-200 dark:border-[#252D3A] bg-white/90 dark:bg-[#090B10]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="focus-visible:outline-none"
        >
          <NexoraLogo size="sm" />
        </button>

        {pageTitle && (
          <span className="font-display text-sm font-semibold truncate max-w-[140px]">
            {pageTitle}
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/search')}
            aria-label="Search"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#141A24]"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#141A24]"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8B5CF6] text-[10px] font-bold text-white flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#141A24]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main 3-Column Container */}
      <div className="max-w-[1380px] mx-auto flex justify-center">
        <LeftSidebar />

        <main className="flex-1 min-w-0 px-3.5 sm:px-6 py-4 sm:py-6 pb-20 lg:pb-8">
          <div className={hideRightSidebar ? 'max-w-5xl mx-auto' : 'max-w-2xl mx-auto'}>
            {children}
          </div>
        </main>

        {!hideRightSidebar && <RightSidebar />}
      </div>

      {/* Mobile Bottom Navigation (56px height) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-[56px] pb-safe border-t border-slate-200 dark:border-[#252D3A] bg-white/95 dark:bg-[#090B10]/95 backdrop-blur-md grid grid-cols-5 items-center"
      >
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center h-full text-[10px] font-medium ${
              isActive
                ? 'text-[#8B5CF6]'
                : 'text-slate-500 dark:text-[#94A3B8]'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center h-full text-[10px] font-medium ${
              isActive
                ? 'text-[#8B5CF6]'
                : 'text-slate-500 dark:text-[#94A3B8]'
            }`
          }
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setCreatePostOpen(true)}
          className="flex flex-col items-center justify-center h-full text-[10px] font-semibold text-[#06B6D4]"
          aria-label="Create post"
        >
          <PlusSquare className="w-5 h-5 mb-0.5" />
          <span>Create</span>
        </button>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center h-full text-[10px] font-medium ${
              isActive
                ? 'text-[#8B5CF6]'
                : 'text-slate-500 dark:text-[#94A3B8]'
            }`
          }
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Messages</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center h-full text-[10px] font-medium ${
              isActive
                ? 'text-[#8B5CF6]'
                : 'text-slate-500 dark:text-[#94A3B8]'
            }`
          }
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
