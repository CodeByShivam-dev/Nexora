import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  Bell,
  Bookmark,
  LogOut,
  Search,
  Settings,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { Avatar } from '../common/Avatar';
import { NexoraLogo } from '../common/NexoraLogo';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { currentUser, unreadNotificationCount, logout } = useNexora();
  const navigate = useNavigate();

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  const links = [
    { to: '/profile', label: 'My Profile', icon: UserIcon },
    { to: '/search', label: 'Search Nexora', icon: Search },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationCount,
    },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/communities', label: 'Communities', icon: Users },
    { to: '/dashboard', label: 'Creator Dashboard', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 w-[82vw] max-w-xs bg-white dark:bg-[#0E121A] border-l border-slate-200 dark:border-[#252D3A] p-5 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-5 overflow-y-auto">
              <div className="flex items-center justify-between">
                <NexoraLogo size="sm" />
                <button
                  type="button"
                  onClick={onClose}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#141A24]"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => goTo('/profile')}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#141A24] flex items-center gap-3 text-left"
                >
                  <Avatar
                    src={currentUser.avatar}
                    name={currentUser.fullName}
                    size="md"
                    verified={currentUser.verified}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
                      @{currentUser.username}
                    </p>
                  </div>
                </button>
              )}

              <nav className="space-y-1">
                {links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => goTo(item.to)}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#141A24] transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#8B5CF6]" />
                        <span>{item.label}</span>
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[11px] font-mono-tabular font-semibold px-1.5 py-0.5 rounded-md bg-[#8B5CF6] text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
