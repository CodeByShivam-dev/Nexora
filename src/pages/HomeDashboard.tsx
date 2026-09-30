import React from 'react';
import { useApp } from '../context/AppContext';
import { PostComposer } from '../components/PostComposer';
import { PostCard } from '../components/PostCard';
import {
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { currentUser, posts, friends, navigate } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NEXORA Daily Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
              {getGreeting()}, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Here is what is happening across your engineering network today.
            </p>
          </div>

          <button
            onClick={() => navigate('profile')}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] shadow-xs hover:bg-[var(--surface-secondary)] transition-all shrink-0"
          >
            <span>View Full Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Profile Completion & Quick Stats */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] text-[var(--muted)] font-medium">Followers</span>
            <div className="text-lg font-bold text-[var(--text)] tabular-nums">
              {currentUser.followersCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-500 font-medium">+14 this week</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[var(--muted)] font-medium">Following</span>
            <div className="text-lg font-bold text-[var(--text)] tabular-nums">
              {currentUser.followingCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-[var(--muted)]">Active connections</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[var(--muted)] font-medium">Published Posts</span>
            <div className="text-lg font-bold text-[var(--text)] tabular-nums">
              {currentUser.postsCount}
            </div>
            <span className="text-[10px] text-[var(--primary)] font-medium">Top 5% reach</span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>Profile Strength</span>
              <span className="font-bold text-[var(--text)]">92%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden mt-1.5">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 w-[92%] rounded-full" />
            </div>
            <span className="text-[10px] text-emerald-500 font-medium">All badges unlocked</span>
          </div>
        </div>
      </div>

      {/* Daily Pulse Widget (Section 13) */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Daily Pulse
            </h3>
          </div>
          <span className="text-[11px] text-[var(--muted)] font-mono">Updated just now</span>
        </div>

        <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-secondary)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)] shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--text)] tabular-nums">12</div>
              <div className="text-[11px] text-[var(--muted)]">New interactions</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-secondary)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[var(--secondary)] shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--text)] tabular-nums">4</div>
              <div className="text-[11px] text-[var(--muted)]">New followers</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-secondary)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 shrink-0">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--text)] tabular-nums">8</div>
              <div className="text-[11px] text-[var(--muted)]">Post likes</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-secondary)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[var(--text)] tabular-nums">3</div>
              <div className="text-[11px] text-[var(--muted)]">New comments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Composer */}
      <PostComposer />

      {/* Recent Feed Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
            Network Activity
          </h2>
          <button
            onClick={() => navigate('feed')}
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            View Feed Mode
          </button>
        </div>

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
