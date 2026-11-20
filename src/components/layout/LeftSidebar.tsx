import {
  BarChart3,
  Bell,
  Bookmark,
  Compass,
  Home,
  LogOut,
  MessageSquare,
  PlusSquare,
  Search,
  Settings,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { Avatar } from '../common/Avatar';
import { NexoraLogo } from '../common/NexoraLogo';

export function LeftSidebar() {
  const {
    currentUser,
    unreadNotificationCount,
    setCreatePostOpen,
    logout,
  } = useNexora();
  const navigate = useNavigate();

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/search', label: 'Search', icon: Search },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationCount,
    },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/communities', label: 'Communities', icon: Users },
    { to: '/profile', label: 'Profile', icon: UserIcon },
    { to: '/dashboard', label: 'Creator Studio', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-[248px] xl:w-[264px] shrink-0 sticky top-0 h-screen py-5 px-4 border-r border-slate-200 dark:border-[#252D3A] bg-white/60 dark:bg-[#0E121A]/80 backdrop-blur-md">
      <div className="space-y-6 overflow-y-auto no-scrollbar pr-1">
        <div className="px-2">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="focus-visible:outline-none"
          >
            <NexoraLogo size="md" />
          </button>
        </div>

        <nav aria-label="Primary navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B5CF6]/15 to-[#06B6D4]/10 text-slate-900 dark:text-[#F8FAFC] border border-[#8B5CF6]/30'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#141A24]'
                  }`
                }
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[11px] font-mono-tabular font-semibold px-1.5 py-0.5 rounded-md bg-[#8B5CF6] text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setCreatePostOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
        >
          <PlusSquare className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* User Mini-Profile */}
      {currentUser && (
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-[#252D3A] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-opacity"
          >
            <Avatar
              src={currentUser.avatar}
              name={currentUser.fullName}
              size="sm"
              verified={currentUser.verified}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                {currentUser.fullName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-[#64748B] truncate">
                @{currentUser.username}
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Sign out"
            aria-label="Sign out"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 dark:text-[#94A3B8] hover:text-[#EF4444] hover:bg-slate-100 dark:hover:bg-[#141A24] transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
