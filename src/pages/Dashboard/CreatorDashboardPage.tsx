import { FileText, Heart, Info, MessageCircle, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '../../components/common/EmptyState';
import { AppShell } from '../../components/layout/AppShell';
import { useNexora } from '../../context/NexoraContext';
import { formatCompactNumber, formatRelativeTime } from '../../utils/formatters';

export function CreatorDashboardPage() {
  const { currentUser, posts, visibleStories, settings } = useNexora();
  const navigate = useNavigate();

  const myPosts = useMemo(
    () => (currentUser ? posts.filter((p) => p.authorId === currentUser.id) : []),
    [posts, currentUser]
  );

  const totalLikes = useMemo(
    () => myPosts.reduce((sum, p) => sum + p.likes.length, 0),
    [myPosts]
  );

  const totalComments = useMemo(
    () =>
      myPosts.reduce(
        (sum, p) =>
          sum +
          p.comments.length +
          p.comments.reduce((rSum, c) => rSum + c.replies.length, 0),
        0
      ),
    [myPosts]
  );

  const totalFollowers = currentUser?.followers.length ?? 0;

  // Build local 7-day follower & engagement activity series anchored to real session counts
  const activitySeries = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseFollowers = Math.max(1, totalFollowers);
    const baseEngagement = Math.max(1, totalLikes + totalComments);
    return days.map((day, idx) => {
      const ratio = (idx + 1) / days.length;
      return {
        day,
        followers: Math.max(1, Math.round(baseFollowers * (0.65 + ratio * 0.35))),
        engagement: Math.max(
          0,
          Math.round((baseEngagement / 4) * (0.5 + ((idx * 3) % 5) * 0.22))
        ),
      };
    });
  }, [totalFollowers, totalLikes, totalComments]);

  const recentPostPerformance = useMemo(
    () =>
      [...myPosts]
        .slice(0, 6)
        .reverse()
        .map((p, idx) => ({
          name: `Post ${idx + 1}`,
          likes: p.likes.length,
          comments: p.comments.length,
          shares: p.sharesCount,
        })),
    [myPosts]
  );

  const myStoryViews = useMemo(() => {
    if (!currentUser) return 0;
    return visibleStories
      .filter((s) => s.authorId === currentUser.id)
      .reduce((acc, s) => acc + s.viewedBy.length, 0);
  }, [visibleStories, currentUser]);

  const axisStroke = settings.theme === 'dark' ? '#64748B' : '#94A3B8';
  const gridStroke = settings.theme === 'dark' ? '#252D3A' : '#E2E8F0';
  const tooltipBg = settings.theme === 'dark' ? '#141A24' : '#FFFFFF';
  const tooltipBorder = settings.theme === 'dark' ? '#252D3A' : '#E2E8F0';

  const kpis = [
    {
      label: 'Total Posts',
      value: myPosts.length,
      icon: FileText,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#8B5CF6]/15',
    },
    {
      label: 'Total Followers',
      value: totalFollowers,
      icon: Users,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/15',
    },
    {
      label: 'Total Likes',
      value: totalLikes,
      icon: Heart,
      color: 'text-[#EF4444]',
      bg: 'bg-[#EF4444]/15',
    },
    {
      label: 'Total Comments',
      value: totalComments,
      icon: MessageCircle,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/15',
    },
  ];

  return (
    <AppShell hideRightSidebar pageTitle="Creator Studio">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Creator Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Overview of your posts, story reach ({myStoryViews} local views), and audience activity.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95"
          >
            New Post
          </button>
        </div>

        {/* Honest Analytics Notice */}
        <div className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] px-4 py-3 flex items-start gap-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
          <Info className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
          <span>
            These metrics are locally calculated demonstration analytics derived from your
            current browser session data—not verified platform-wide statistics.
          </span>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
                    {kpi.label}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                  {formatCompactNumber(kpi.value)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Follower & Engagement Area Chart */}
          <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Follower &amp; Engagement Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#64748B]">
                7-day simulated local trend based on your current follower &amp; interaction counts
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activitySeries}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="folGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="day" stroke={axisStroke} fontSize={12} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    name="Followers"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#folGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    name="Interactions"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#engGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Recent Post Performance Bar Chart */}
          <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-5 space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Recent Post Performance
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#64748B]">
                Likes, comments, and shares across your latest posts
              </p>
            </div>
            {recentPostPerformance.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 dark:text-[#64748B]">
                Publish a post to inspect per-post engagement bars.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentPostPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="name" stroke={axisStroke} fontSize={12} tickLine={false} />
                    <YAxis stroke={axisStroke} fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="likes" name="Likes" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="comments" name="Comments" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="shares" name="Shares" fill="#22C55E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>

        {/* Recent Posts Breakdown Table */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-[#252D3A]">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Your Post Engagement Summary
            </h2>
          </div>
          {myPosts.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No published posts yet"
                description="Create your first post to see engagement analytics update automatically."
                actionLabel="Create First Post"
                onAction={() => navigate('/create')}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#252D3A] text-xs font-medium text-slate-500 dark:text-[#64748B]">
                    <th className="py-3 px-5">Post</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Likes</th>
                    <th className="py-3 px-4 text-right">Comments</th>
                    <th className="py-3 px-5 text-right">Shares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#252D3A] text-sm">
                  {myPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1A2230]/40 transition-colors"
                    >
                      <td className="py-3.5 px-5 max-w-xs">
                        <p className="text-slate-900 dark:text-[#F8FAFC] truncate font-medium">
                          {post.content || 'Visual post'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#64748B]">
                          {formatRelativeTime(post.createdAt)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-[#94A3B8]">
                        {post.category}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-tabular text-slate-900 dark:text-[#F8FAFC]">
                        {post.likes.length}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-tabular text-slate-900 dark:text-[#F8FAFC]">
                        {post.comments.length}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono-tabular text-slate-900 dark:text-[#F8FAFC]">
                        {post.sharesCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
