import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { Avatar } from '../common/Avatar';

export function StoriesBar() {
  const {
    currentUser,
    users,
    visibleStories,
    setActiveStoryUserId,
    setCreateStoryOpen,
  } = useNexora();

  const groupedAuthors = useMemo(() => {
    const map = new Map<string, { hasUnseen: boolean; latestAt: number }>();
    visibleStories.forEach((story) => {
      const isSeen = currentUser ? story.viewedBy.includes(currentUser.id) : true;
      const existing = map.get(story.authorId);
      const time = new Date(story.createdAt).getTime();
      if (!existing) {
        map.set(story.authorId, { hasUnseen: !isSeen, latestAt: time });
      } else {
        map.set(story.authorId, {
          hasUnseen: existing.hasUnseen || !isSeen,
          latestAt: Math.max(existing.latestAt, time),
        });
      }
    });

    const list = Array.from(map.entries())
      .map(([userId, meta]) => ({
        user: users.find((u) => u.id === userId),
        ...meta,
      }))
      .filter((item) => Boolean(item.user) && item.user!.id !== currentUser?.id);

    list.sort((a, b) => {
      if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
      return b.latestAt - a.latestAt;
    });

    return list;
  }, [visibleStories, users, currentUser]);

  const myStories = useMemo(
    () => (currentUser ? visibleStories.filter((s) => s.authorId === currentUser.id) : []),
    [visibleStories, currentUser]
  );

  const myHasUnseen = useMemo(
    () =>
      Boolean(
        currentUser &&
          myStories.some((s) => !s.viewedBy.includes(currentUser.id))
      ),
    [myStories, currentUser]
  );

  if (!currentUser) return null;

  return (
    <section
      aria-label="Stories"
      className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-3.5 sm:p-4"
    >
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-0.5 touch-pan-x">
        {/* Add Story Action */}
        <button
          type="button"
          onClick={() => setCreateStoryOpen(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 w-[68px] group focus-visible:outline-none"
        >
          <div className="w-[62px] h-[62px] rounded-full border border-dashed border-[#8B5CF6]/70 bg-[#8B5CF6]/10 flex items-center justify-center text-[#06B6D4] group-hover:border-[#06B6D4] group-hover:scale-[1.03] transition-all">
            <Plus className="w-6 h-6 stroke-[2.25]" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-[#94A3B8] truncate w-full text-center">
            Add Story
          </span>
        </button>

        {/* Your Active Story (when present) */}
        {myStories.length > 0 && (
          <div className="flex flex-col items-center gap-1.5 shrink-0 w-[68px]">
            <Avatar
              src={currentUser.avatar}
              name="Your Story"
              size="lg"
              ringState={myHasUnseen ? 'unseen' : 'seen'}
              onClick={() => setActiveStoryUserId(currentUser.id)}
            />
            <span className="text-[11px] font-medium text-slate-800 dark:text-[#F8FAFC] truncate w-full text-center">
              Your Story
            </span>
          </div>
        )}

        {/* Other Creators' Stories */}
        {groupedAuthors.map(({ user, hasUnseen }) => {
          if (!user) return null;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => setActiveStoryUserId(user.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-[68px] group focus-visible:outline-none"
            >
              <Avatar
                src={user.avatar}
                name={user.fullName}
                size="lg"
                ringState={hasUnseen ? 'unseen' : 'seen'}
                className="group-hover:scale-[1.03] transition-transform"
              />
              <span className="text-[11px] font-medium text-slate-800 dark:text-[#F8FAFC] truncate w-full text-center">
                {user.username}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
