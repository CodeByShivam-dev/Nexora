import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { Avatar } from '../common/Avatar';

interface FollowListModalProps {
  open: boolean;
  title: string;
  userIds: string[];
  onClose: () => void;
}

export function FollowListModal({ open, title, userIds, onClose }: FollowListModalProps) {
  const { users, currentUser, toggleFollow } = useNexora();
  const navigate = useNavigate();
  const listUsers = users.filter((u) => userIds.includes(u.id));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#252D3A]">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2230]"
                aria-label="Close list"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-[#252D3A]">
              {listUsers.length === 0 ? (
                <div className="py-10 px-6 text-center text-sm text-slate-500 dark:text-[#64748B]">
                  No accounts to display yet.
                </div>
              ) : (
                listUsers.map((person) => {
                  const isMe = currentUser?.id === person.id;
                  const isFollowing = currentUser?.following.includes(person.id) ?? false;
                  return (
                    <div
                      key={person.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-[#1A2230]/50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(`/profile/${person.username}`);
                        }}
                        className="flex items-center gap-3 min-w-0 text-left"
                      >
                        <Avatar
                          src={person.avatar}
                          name={person.fullName}
                          size="md"
                          verified={person.verified}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                            {person.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8] truncate">
                            @{person.username}
                          </p>
                        </div>
                      </button>
                      {!isMe && currentUser && (
                        <button
                          type="button"
                          onClick={() => toggleFollow(person.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                            isFollowing
                              ? 'border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#94A3B8] hover:border-[#EF4444] hover:text-[#EF4444]'
                              : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
