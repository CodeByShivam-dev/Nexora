import { AnimatePresence, motion } from 'motion/react';
import { Flag, X } from 'lucide-react';
import { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';

interface ReportModalProps {
  postId: string | null;
  onClose: () => void;
}

const REASONS = [
  'Spam or misleading content',
  'Harassment or abusive behavior',
  'Off-topic or inappropriate media',
  'Copyright or attribution concern',
];

export function ReportModal({ postId, onClose }: ReportModalProps) {
  const { reportPost } = useNexora();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;
    reportPost(postId, reason, details);
    setDetails('');
    onClose();
  };

  return (
    <AnimatePresence>
      {postId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Flag className="w-5 h-5 text-[#EF4444]" />
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Report Post
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2230]"
                aria-label="Close report dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-[#64748B]">
              Frontend demo moderation flow. Reports are saved locally in your browser session.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                {REASONS.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      reason === item
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                        : 'border-slate-200 dark:border-[#252D3A] hover:bg-slate-50 dark:hover:bg-[#1A2230]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      checked={reason === item}
                      onChange={() => setReason(item)}
                      className="accent-[#8B5CF6]"
                    />
                    <span className="text-sm text-slate-800 dark:text-[#F8FAFC]">{item}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-1.5">
                  Additional context (optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Share brief context..."
                  className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
