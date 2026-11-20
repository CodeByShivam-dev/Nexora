import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { Post } from '../../types';
import { PostCard } from './PostCard';

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  return (
    <AnimatePresence>
      {post && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#090B10] p-4 sm:p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-[#252D3A]">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Post Details
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2230]"
                aria-label="Close post details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PostCard post={post} defaultShowComments />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
