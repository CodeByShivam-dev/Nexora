import { ArrowUpRight, Hash, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { formatCompactNumber } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';

export function RightSidebar() {
  const { currentUser, users, posts, communities, toggleFollow } = useNexora();
  const navigate = useNavigate();

  const suggestedUsers = useMemo(() => {
    if (!currentUser) return users.slice(0, 3);
    return users
      .filter((u) => u.id !== currentUser.id && !currentUser.following.includes(u.id))
      .slice(0, 3);
  }, [users, currentUser]);

  const trendingHashtags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      post.hashtags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1 + post.likes.length);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [posts]);

  const popularCommunities = useMemo(
    () =>
      [...communities]
        .sort((a, b) => b.memberIds.length - a.memberIds.length)
        .slice(0, 3),
    [communities]
  );

  return (
    <aside className="hidden xl:flex flex-col gap-5 w-[310px] shrink-0 sticky top-0 h-screen overflow-y-auto no-scrollbar py-5 px-4">
      {/* Trending Topics & Hashtags */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#06B6D4]" />
            Trending Topics
          </h2>
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="text-xs font-medium text-[#8B5CF6] hover:underline"
          >
            Explore
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#252D3A]">
          {trendingHashtags.map(([tag, score], idx) => (
            <button
              key={tag}
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent('#' + tag)}`)}
              className="w-full py-2.5 flex items-center justify-between gap-2 text-left group"
            >
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-[#64748B]">
                  0{idx + 1}. Trending topic
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#06B6D4] transition-colors truncate flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                  {tag}
                </p>
              </div>
              <span className="text-xs font-mono-tabular text-slate-500 dark:text-[#64748B] shrink-0">
                {score} pts
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Suggested Creators */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Suggested Creators
          </h2>
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="text-xs font-medium text-[#06B6D4] hover:underline"
          >
            See all
          </button>
        </div>

        {suggestedUsers.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-[#64748B]">
            You are following all featured demo creators.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestedUsers.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${person.username}`)}
                  className="flex items-center gap-2.5 min-w-0 text-left"
                >
                  <Avatar
                    src={person.avatar}
                    name={person.fullName}
                    size="sm"
                    verified={person.verified}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                      {person.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-[#64748B] truncate">
                      @{person.username}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFollow(person.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-[#1A2230] text-white dark:text-[#F8FAFC] border border-transparent dark:border-[#252D3A] hover:border-[#8B5CF6] transition-colors whitespace-nowrap shrink-0"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Communities */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8B5CF6]" />
            Popular Communities
          </h2>
          <button
            type="button"
            onClick={() => navigate('/communities')}
            className="text-xs font-medium text-[#8B5CF6] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="space-y-2.5">
          {popularCommunities.map((comm) => (
            <button
              key={comm.id}
              type="button"
              onClick={() => navigate(`/communities/${comm.id}`)}
              className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-[#252D3A] bg-slate-50/70 dark:bg-[#0E121A] hover:border-[#06B6D4]/50 transition-colors flex items-center justify-between gap-2 text-left"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                  {comm.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#64748B] truncate">
                  {comm.category} · {formatCompactNumber(comm.memberIds.length)} members
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
