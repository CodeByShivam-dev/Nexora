import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { CreatePostForm } from '../../components/posts/CreatePostModal';

export function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <AppShell pageTitle="Create Post">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="min-w-[38px] min-h-[38px] rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] flex items-center justify-center text-slate-700 dark:text-[#F8FAFC]"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Create Post
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Share ideas, photography, or updates with your local NEXORA network.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 sm:p-6">
          <CreatePostForm
            onSuccess={() => navigate('/home')}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>
    </AppShell>
  );
}
