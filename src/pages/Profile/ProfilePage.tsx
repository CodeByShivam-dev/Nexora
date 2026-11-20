import {
  Calendar,
  Edit3,
  Globe,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  Star,
  UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { MediaImage } from '../../components/common/MediaResolver';
import { AppShell } from '../../components/layout/AppShell';
import { FollowListModal } from '../../components/modals/FollowListModal';
import { PostCard } from '../../components/posts/PostCard';
import { PostDetailModal } from '../../components/posts/PostDetailModal';
import { ManageHighlightModal } from '../../components/stories/ManageHighlightModal';
import { useNexora } from '../../context/NexoraContext';
import { Post, StoryHighlight } from '../../types';
import { formatCompactNumber, formatFullDate } from '../../utils/formatters';

type ProfileTab = 'posts' | 'replies' | 'media' | 'liked';

export function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const {
    currentUser,
    getUserByUsername,
    posts,
    highlights,
    visibleStories,
    setActiveStoryUserId,
    setActiveHighlightId,
    toggleFollow,
    toggleCloseFriend,
    startOrGetConversation,
  } = useNexora();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<StoryHighlight | null>(null);

  const profileUser = username ? getUserByUsername(username) : currentUser;

  const userPosts = useMemo(
    () =>
      profileUser
        ? posts
            .filter((p) => p.authorId === profileUser.id)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        : [],
    [posts, profileUser]
  );

  const userHighlights = useMemo(
    () =>
      profileUser
        ? highlights.filter((h) => h.userId === profileUser.id && h.storyIds.length > 0)
        : [],
    [highlights, profileUser]
  );

  const userRepliedPosts = useMemo(
    () =>
      profileUser
        ? posts.filter((p) =>
            p.comments.some((c) => c.authorId === profileUser.id)
          )
        : [],
    [posts, profileUser]
  );

  const userMediaPosts = useMemo(
    () => userPosts.filter((p) => p.images.length > 0 || Boolean(p.videoUrl)),
    [userPosts]
  );

  const userLikedPosts = useMemo(
    () =>
      profileUser
        ? posts.filter((p) => p.likes.includes(profileUser.id))
        : [],
    [posts, profileUser]
  );

  if (!profileUser) {
    return (
      <AppShell pageTitle="Profile">
        <EmptyState
          icon={UserPlus}
          title="Creator not found"
          description="This profile does not exist in your local browser dataset."
          actionLabel="Return Home"
          onAction={() => navigate('/home')}
        />
      </AppShell>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isFollowing = currentUser?.following.includes(profileUser.id) ?? false;
  const isCloseFriend = currentUser?.closeFriends.includes(profileUser.id) ?? false;
  const hasStories = visibleStories.some((s) => s.authorId === profileUser.id);

  const handleMessageClick = () => {
    const conv = startOrGetConversation(profileUser.id);
    if (conv) {
      navigate(`/messages/${conv.id}`);
    }
  };

  return (
    <AppShell pageTitle={profileUser.fullName}>
      <div className="space-y-5">
        {/* Profile Header Card */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-hidden">
          <div className="h-36 sm:h-48 w-full bg-[#0E121A] overflow-hidden">
            <MediaImage
              src={profileUser.coverImage}
              alt={`${profileUser.fullName} cover`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="px-5 pb-5">
            <div className="flex flex-wrap items-end justify-between gap-4 -mt-12 mb-4">
              <div className="rounded-full p-1 bg-white dark:bg-[#141A24]">
                <Avatar
                  src={profileUser.avatar}
                  name={profileUser.fullName}
                  size="xl"
                  verified={profileUser.verified}
                  ringState={hasStories ? 'unseen' : 'none'}
                  onClick={
                    hasStories ? () => setActiveStoryUserId(profileUser.id) : undefined
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => navigate('/profile/edit')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#1A2230] text-slate-900 dark:text-[#F8FAFC] hover:border-[#8B5CF6] transition-colors inline-flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleFollow(profileUser.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isFollowing
                          ? 'border border-slate-200 dark:border-[#252D3A] text-slate-700 dark:text-[#F8FAFC] hover:border-[#EF4444] hover:text-[#EF4444]'
                          : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button
                      type="button"
                      onClick={handleMessageClick}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#1A2230] text-slate-800 dark:text-[#F8FAFC] hover:border-[#06B6D4] inline-flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCloseFriend(profileUser.id)}
                      title={
                        isCloseFriend ? 'Remove from Close Friends' : 'Add to Close Friends'
                      }
                      aria-label="Toggle close friend"
                      className={`p-2 rounded-xl border transition-colors ${
                        isCloseFriend
                          ? 'border-[#22C55E]/50 bg-[#22C55E]/15 text-[#22C55E]'
                          : 'border-slate-200 dark:border-[#252D3A] text-slate-500 dark:text-[#94A3B8] hover:text-[#22C55E]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isCloseFriend ? 'fill-current' : ''}`} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {profileUser.fullName}
                </h1>
                <p className="text-sm text-slate-500 dark:text-[#64748B]">
                  @{profileUser.username}
                  {profileUser.roleTitle ? ` · ${profileUser.roleTitle}` : ''}
                </p>
              </div>

              {profileUser.bio && (
                <p className="text-sm text-slate-700 dark:text-[#E2E8F0] leading-relaxed max-w-2xl">
                  {profileUser.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
                {profileUser.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                    {profileUser.location}
                  </span>
                )}
                {profileUser.website && (
                  <a
                    href={
                      profileUser.website.startsWith('http')
                        ? profileUser.website
                        : `https://${profileUser.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#06B6D4] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Joined {formatFullDate(profileUser.joinedAt)}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-5 text-sm">
                <div>
                  <span className="font-display font-bold tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                    {formatCompactNumber(userPosts.length)}
                  </span>{' '}
                  <span className="text-slate-500 dark:text-[#94A3B8] text-xs">Posts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFollowModal('followers')}
                  className="hover:underline"
                >
                  <span className="font-display font-bold tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                    {formatCompactNumber(profileUser.followers.length)}
                  </span>{' '}
                  <span className="text-slate-500 dark:text-[#94A3B8] text-xs">
                    Followers
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFollowModal('following')}
                  className="hover:underline"
                >
                  <span className="font-display font-bold tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                    {formatCompactNumber(profileUser.following.length)}
                  </span>{' '}
                  <span className="text-slate-500 dark:text-[#94A3B8] text-xs">
                    Following
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Story Highlights Strip */}
        {(userHighlights.length > 0 || isOwnProfile) && (
          <section
            aria-label="Story highlights"
            className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                Story Highlights
              </h2>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingHighlight(null);
                    setHighlightModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#06B6D4] hover:underline"
                >
                  + New Highlight
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-0.5">
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingHighlight(null);
                    setHighlightModalOpen(true);
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0 w-[68px] group"
                >
                  <div className="w-14 h-14 rounded-full border border-dashed border-slate-300 dark:border-[#364152] bg-slate-50 dark:bg-[#0E121A] flex items-center justify-center text-[#8B5CF6] group-hover:border-[#8B5CF6] transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-[#94A3B8] truncate w-full text-center">
                    New
                  </span>
                </button>
              )}

              {userHighlights.map((hl) => (
                <div
                  key={hl.id}
                  className="relative flex flex-col items-center gap-1.5 shrink-0 w-[68px] group"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHighlightId(hl.id)}
                    className="p-[2px] rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] hover:scale-[1.03] transition-transform"
                  >
                    <div className="p-[2px] rounded-full bg-white dark:bg-[#141A24]">
                      <MediaImage
                        src={hl.coverUrl}
                        alt={hl.title}
                        className="w-14 h-14 rounded-full object-cover bg-[#0E121A]"
                      />
                    </div>
                  </button>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingHighlight(hl);
                        setHighlightModalOpen(true);
                      }}
                      title="Edit highlight"
                      aria-label={`Edit ${hl.title}`}
                      className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#141A24] border border-[#252D3A] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  )}
                  <span className="text-[11px] font-medium text-slate-800 dark:text-[#F8FAFC] truncate w-full text-center">
                    {hl.title}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profile Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24]">
          {[
            { id: 'posts' as ProfileTab, label: 'Posts' },
            { id: 'replies' as ProfileTab, label: 'Replies' },
            { id: 'media' as ProfileTab, label: 'Media' },
            { id: 'liked' as ProfileTab, label: 'Likes' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userPosts.length === 0 ? (
              <EmptyState
                icon={Edit3}
                title="No posts yet"
                description="Posts published by this creator will appear here."
              />
            ) : (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenDetail={(p) => setSelectedPost(p)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'replies' && (
          <div className="space-y-4">
            {userRepliedPosts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No replies yet"
                description="Posts this creator commented on will appear here."
              />
            ) : (
              userRepliedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  defaultShowComments
                  onOpenDetail={(p) => setSelectedPost(p)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
            {userMediaPosts.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="No media uploads yet"
                description="Image and video posts shared by this creator will appear in this gallery."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {userMediaPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-[#252D3A] bg-slate-100 dark:bg-[#141A24] group"
                  >
                    {post.images[0] ? (
                      <MediaImage
                        src={post.images[0]}
                        alt={post.content.slice(0, 50)}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#06B6D4] bg-[#0E121A]">
                        Video Post
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="space-y-4">
            {userLikedPosts.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No liked posts yet"
                description="Posts liked by this creator will show up here."
              />
            ) : (
              userLikedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenDetail={(p) => setSelectedPost(p)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <FollowListModal
        open={followModal !== null}
        title={followModal === 'followers' ? 'Followers' : 'Following'}
        userIds={
          followModal === 'followers'
            ? profileUser.followers
            : followModal === 'following'
            ? profileUser.following
            : []
        }
        onClose={() => setFollowModal(null)}
      />

      <PostDetailModal
        post={
          selectedPost ? posts.find((p) => p.id === selectedPost.id) ?? selectedPost : null
        }
        onClose={() => setSelectedPost(null)}
      />

      <ManageHighlightModal
        open={highlightModalOpen}
        editingHighlight={editingHighlight}
        onClose={() => {
          setHighlightModalOpen(false);
          setEditingHighlight(null);
        }}
      />
    </AppShell>
  );
}
