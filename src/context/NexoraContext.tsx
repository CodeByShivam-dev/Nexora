import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createAvatarVisual, createCoverVisual } from '../assets/visuals';
import { createSeedData, DEMO_ACCOUNT_CREDENTIALS } from '../data/seedData';
import { clearMediaDB } from '../services/mediaDB';
import { DEFAULT_SETTINGS, storage } from '../services/storage';
import {
  AppNotification,
  AppSettings,
  Community,
  Conversation,
  Message,
  NotificationType,
  Post,
  PostCategory,
  ReportRecord,
  Story,
  StoryHighlight,
  StoryPrivacy,
  ToastItem,
  User,
} from '../types';
import {
  extractHashtags,
  extractMentions,
  generateId,
  getInitials,
  isStoryExpired,
} from '../utils/formatters';

interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

interface CreatePostPayload {
  content: string;
  images: string[];
  videoUrl?: string;
  hashtags: string[];
  category: PostCategory;
  communityId?: string;
}

interface CreateStoryPayload {
  mediaType: 'image' | 'video' | 'text';
  mediaUrl?: string;
  imageFit?: 'cover' | 'contain';
  textOverlay?: string;
  textAlign?: 'left' | 'center' | 'right';
  textSize?: 'sm' | 'md' | 'lg';
  caption?: string;
  backgroundStyle?: string;
  privacy: StoryPrivacy;
}

interface CreateHighlightPayload {
  title: string;
  coverUrl: string;
  storyIds: string[];
}

interface UpdateProfilePayload {
  fullName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  coverImage: string;
}

interface NexoraContextValue {
  // Data
  currentUser: User | null;
  users: User[];
  posts: Post[];
  stories: Story[];
  highlights: StoryHighlight[];
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: Message[];
  communities: Community[];
  bookmarkedPostIds: string[];
  settings: AppSettings;
  recentSearches: string[];
  toasts: ToastItem[];
  activeStoryUserId: string | null;
  activeHighlightId: string | null;
  isCreatePostOpen: boolean;
  isCreateStoryOpen: boolean;

  // Modals & UI Triggers
  setActiveStoryUserId: (userId: string | null) => void;
  setActiveHighlightId: (highlightId: string | null) => void;
  setCreatePostOpen: (open: boolean) => void;
  setCreateStoryOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Auth
  login: (identifier: string, password: string) => { ok: boolean; error?: string };
  loginDemo: () => void;
  register: (payload: RegisterPayload) => { ok: boolean; error?: string };
  logout: () => void;
  isUsernameAvailable: (username: string, excludeUserId?: string) => boolean;

  // Users & Follow
  getUserById: (id: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  toggleFollow: (targetUserId: string) => void;
  toggleCloseFriend: (targetUserId: string) => void;
  updateProfile: (payload: UpdateProfilePayload) => { ok: boolean; error?: string };
  changePasswordDemo: (currentPassword: string, newPassword: string) => { ok: boolean; error?: string };

  // Posts & Comments
  createPost: (payload: CreatePostPayload) => Post | null;
  editPost: (postId: string, content: string, category: PostCategory, hashtags: string[]) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  incrementShareCount: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  addReplyToComment: (postId: string, commentId: string, content: string) => void;
  reportPost: (postId: string, reason: string, details: string) => void;

  // Bookmarks
  toggleBookmark: (postId: string) => void;
  isBookmarked: (postId: string) => boolean;

  // Stories & Highlights
  visibleStories: Story[];
  createStory: (payload: CreateStoryPayload) => Story | null;
  deleteStory: (storyId: string) => void;
  markStoryViewed: (storyId: string) => void;
  reactToStory: (storyId: string, emoji: string) => void;
  replyToStory: (storyId: string, text: string) => void;
  createHighlight: (payload: CreateHighlightPayload) => StoryHighlight | null;
  updateHighlight: (highlightId: string, payload: CreateHighlightPayload) => void;
  deleteHighlight: (highlightId: string) => void;

  // Notifications
  userNotifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Messaging
  startOrGetConversation: (otherUserId: string) => Conversation | null;
  sendMessage: (conversationId: string, text: string) => void;
  deleteMessage: (messageId: string) => void;

  // Communities
  toggleJoinCommunity: (communityId: string) => void;

  // Search
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Settings & Reset
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  resetDemoData: () => Promise<void>;
}

const NexoraContext = createContext<NexoraContextValue | null>(null);

function initializeAppState() {
  if (!storage.isSeeded()) {
    const seed = createSeedData();
    storage.saveUsers(seed.users);
    storage.savePosts(seed.posts);
    storage.saveStories(seed.stories);
    storage.saveHighlights(seed.highlights);
    storage.saveCommunities(seed.communities);
    storage.saveNotifications(seed.notifications);
    storage.saveConversations(seed.conversations);
    storage.saveMessages(seed.messages);
    storage.saveBookmarksMap(seed.bookmarksMap);
    storage.saveSettings(DEFAULT_SETTINGS);
    storage.saveRecentSearches(['#DesignSystems', 'maya.lin', 'React Developers']);
    storage.markSeeded();
  }

  const users = storage.getUsers();
  if (users.length === 0) {
    const seed = createSeedData();
    storage.saveUsers(seed.users);
    storage.savePosts(seed.posts);
    storage.saveStories(seed.stories);
    storage.saveHighlights(seed.highlights);
    storage.saveCommunities(seed.communities);
    storage.saveNotifications(seed.notifications);
    storage.saveConversations(seed.conversations);
    storage.saveMessages(seed.messages);
    storage.saveBookmarksMap(seed.bookmarksMap);
    storage.markSeeded();
  }
}

initializeAppState();

export function NexoraProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => {
    const storedId = storage.getSessionUserId();
    const existingUsers = storage.getUsers();
    if (storedId && existingUsers.some((u) => u.id === storedId)) {
      return storedId;
    }
    if (storedId) {
      storage.setSessionUserId(null);
    }
    return null;
  });
  const [posts, setPosts] = useState<Post[]>(() => storage.getPosts());
  const [stories, setStories] = useState<Story[]>(() => storage.getStories());
  const [highlights, setHighlights] = useState<StoryHighlight[]>(() =>
    storage.getHighlights()
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storage.getNotifications()
  );
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    storage.getConversations()
  );
  const [messages, setMessages] = useState<Message[]>(() => storage.getMessages());
  const [communities, setCommunities] = useState<Community[]>(() =>
    storage.getCommunities()
  );
  const [bookmarksMap, setBookmarksMap] = useState<Record<string, string[]>>(() =>
    storage.getBookmarksMap()
  );
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    storage.getRecentSearches()
  );
  const [reports, setReports] = useState<ReportRecord[]>(() => storage.getReports());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeStoryUserId, setActiveStoryUserId] = useState<string | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setCreateStoryOpen] = useState(false);
  const [, setTick] = useState(0);

  const currentUser = useMemo(
    () => users.find((u) => u.id === sessionUserId) ?? null,
    [users, sessionUserId]
  );

  // Sync theme on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.saveUsers(users);
  }, [users]);

  useEffect(() => {
    storage.savePosts(posts);
  }, [posts]);

  useEffect(() => {
    storage.saveStories(stories);
  }, [stories]);

  useEffect(() => {
    storage.saveHighlights(highlights);
  }, [highlights]);

  useEffect(() => {
    storage.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    storage.saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    storage.saveCommunities(communities);
  }, [communities]);

  useEffect(() => {
    storage.saveBookmarksMap(bookmarksMap);
  }, [bookmarksMap]);

  useEffect(() => {
    storage.saveRecentSearches(recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    storage.saveReports(reports);
  }, [reports]);

  // Periodic re-evaluation for 24-hour story expiration
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((t) => t + 1);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = generateId('toast');
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushNotification = useCallback(
    (payload: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
      if (payload.recipientId === payload.actorId) return;
      const newNotif: AppNotification = {
        ...payload,
        id: generateId('notif'),
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users]
  );

  const getUserByUsername = useCallback(
    (username: string) =>
      users.find((u) => u.username.toLowerCase() === username.toLowerCase()),
    [users]
  );

  const isUsernameAvailable = useCallback(
    (username: string, excludeUserId?: string) => {
      const normalized = username.trim().toLowerCase();
      return !users.some(
        (u) => u.username.toLowerCase() === normalized && u.id !== excludeUserId
      );
    },
    [users]
  );

  const login = useCallback(
    (identifier: string, password: string) => {
      const normalized = identifier.trim().toLowerCase();
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === normalized ||
          u.username.toLowerCase() === normalized
      );
      if (!matched) {
        return { ok: false, error: 'No local account found with that email or username.' };
      }
      if (matched.passwordHash !== password) {
        return { ok: false, error: 'Incorrect password for this local demo account.' };
      }
      setSessionUserId(matched.id);
      storage.setSessionUserId(matched.id);
      addToast({
        type: 'success',
        title: `Welcome back, ${matched.fullName}`,
        description: 'Signed in locally in this browser session.',
      });
      return { ok: true };
    },
    [users, addToast]
  );

  const loginDemo = useCallback(() => {
    const demoUser =
      users.find((u) => u.username === DEMO_ACCOUNT_CREDENTIALS.username) ?? users[0];
    if (!demoUser) return;
    setSessionUserId(demoUser.id);
    storage.setSessionUserId(demoUser.id);
    addToast({
      type: 'success',
      title: `Signed in as ${demoUser.fullName}`,
      description: 'Exploring NEXORA with the local demo profile.',
    });
  }, [users, addToast]);

  const register = useCallback(
    ({ fullName, username, email, password }: RegisterPayload) => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
        return { ok: false, error: 'That username is already taken locally.' };
      }
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { ok: false, error: 'An account with this email already exists locally.' };
      }

      const newUser: User = {
        id: generateId('user'),
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: password,
        avatar: createAvatarVisual(getInitials(fullName), '#8B5CF6', '#06B6D4', 'orbit'),
        coverImage: createCoverVisual('#8B5CF6', '#06B6D4'),
        bio: 'New creator on NEXORA. Exploring ideas, stories, and communities.',
        location: '',
        website: '',
        joinedAt: new Date().toISOString(),
        verified: false,
        followers: [],
        following: ['user_alex'],
        closeFriends: [],
        isPrivate: false,
        roleTitle: 'Creator',
      };

      setUsers((prev) =>
        prev
          .map((u) =>
            u.id === 'user_alex'
              ? { ...u, followers: Array.from(new Set([...u.followers, newUser.id])) }
              : u
          )
          .concat(newUser)
      );
      setSessionUserId(newUser.id);
      storage.setSessionUserId(newUser.id);
      addToast({
        type: 'success',
        title: 'Account created locally',
        description: `Welcome to NEXORA, @${newUser.username}.`,
      });
      return { ok: true };
    },
    [users, addToast]
  );

  const logout = useCallback(() => {
    setSessionUserId(null);
    storage.setSessionUserId(null);
    setActiveStoryUserId(null);
    setActiveHighlightId(null);
    addToast({
      type: 'info',
      title: 'Signed out',
      description: 'Your local session has ended.',
    });
  }, [addToast]);

  const toggleFollow = useCallback(
    (targetUserId: string) => {
      if (!currentUser || currentUser.id === targetUserId) return;
      const isAlreadyFollowing = currentUser.following.includes(targetUserId);

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) {
            const nextFollowing = isAlreadyFollowing
              ? u.following.filter((id) => id !== targetUserId)
              : Array.from(new Set([...u.following, targetUserId]));
            return { ...u, following: nextFollowing };
          }
          if (u.id === targetUserId) {
            const nextFollowers = isAlreadyFollowing
              ? u.followers.filter((id) => id !== currentUser.id)
              : Array.from(new Set([...u.followers, currentUser.id]));
            return { ...u, followers: nextFollowers };
          }
          return u;
        })
      );

      if (!isAlreadyFollowing) {
        pushNotification({
          recipientId: targetUserId,
          actorId: currentUser.id,
          type: NotificationType.FOLLOW,
        });
        const target = users.find((u) => u.id === targetUserId);
        addToast({
          type: 'success',
          title: `Following @${target?.username ?? 'creator'}`,
        });
      }
    },
    [currentUser, users, pushNotification, addToast]
  );

  const toggleCloseFriend = useCallback(
    (targetUserId: string) => {
      if (!currentUser || currentUser.id === targetUserId) return;
      const exists = currentUser.closeFriends.includes(targetUserId);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== currentUser.id) return u;
          return {
            ...u,
            closeFriends: exists
              ? u.closeFriends.filter((id) => id !== targetUserId)
              : [...u.closeFriends, targetUserId],
          };
        })
      );
      addToast({
        type: 'info',
        title: exists ? 'Removed from Close Friends' : 'Added to Close Friends',
      });
    },
    [currentUser, addToast]
  );

  const updateProfile = useCallback(
    (payload: UpdateProfilePayload) => {
      if (!currentUser) return { ok: false, error: 'No active session.' };
      const cleanUsername = payload.username.trim().toLowerCase();
      if (!isUsernameAvailable(cleanUsername, currentUser.id)) {
        return { ok: false, error: 'That username is already used by another local account.' };
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                fullName: payload.fullName.trim(),
                username: cleanUsername,
                bio: payload.bio.trim(),
                location: payload.location.trim(),
                website: payload.website.trim(),
                avatar: payload.avatar || u.avatar,
                coverImage: payload.coverImage || u.coverImage,
              }
            : u
        )
      );
      addToast({
        type: 'success',
        title: 'Profile updated',
        description: 'Changes saved locally.',
      });
      return { ok: true };
    },
    [currentUser, isUsernameAvailable, addToast]
  );

  const changePasswordDemo = useCallback(
    (currentPassword: string, newPassword: string) => {
      if (!currentUser) return { ok: false, error: 'Not signed in.' };
      if (currentUser.passwordHash !== currentPassword) {
        return { ok: false, error: 'Current password does not match.' };
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, passwordHash: newPassword } : u
        )
      );
      addToast({
        type: 'success',
        title: 'Local password updated',
        description: 'Updated for this browser demonstration account.',
      });
      return { ok: true };
    },
    [currentUser, addToast]
  );

  const createPost = useCallback(
    (payload: CreatePostPayload): Post | null => {
      if (!currentUser) return null;
      const inlineTags = extractHashtags(payload.content);
      const mergedTags = Array.from(
        new Set([...payload.hashtags.map((t) => t.replace(/^#/, '').toLowerCase()), ...inlineTags])
      ).filter(Boolean);

      const newPost: Post = {
        id: generateId('post'),
        authorId: currentUser.id,
        content: payload.content.trim(),
        images: payload.images,
        videoUrl: payload.videoUrl,
        hashtags: mergedTags,
        category: payload.category,
        communityId: payload.communityId,
        likes: [],
        comments: [],
        sharesCount: 0,
        createdAt: new Date().toISOString(),
      };

      setPosts((prev) => [newPost, ...prev]);

      const mentions = extractMentions(payload.content);
      mentions.forEach((uname) => {
        const mentionedUser = users.find((u) => u.username.toLowerCase() === uname);
        if (mentionedUser) {
          pushNotification({
            recipientId: mentionedUser.id,
            actorId: currentUser.id,
            type: NotificationType.MENTION,
            postId: newPost.id,
            previewText: newPost.content.slice(0, 80),
          });
        }
      });

      addToast({
        type: 'success',
        title: 'Post published',
        description: 'Your post is now live in the local feed.',
      });
      return newPost;
    },
    [currentUser, users, pushNotification, addToast]
  );

  const editPost = useCallback(
    (postId: string, content: string, category: PostCategory, hashtags: string[]) => {
      if (!currentUser) return;
      const inlineTags = extractHashtags(content);
      const merged = Array.from(
        new Set([...hashtags.map((t) => t.replace(/^#/, '').toLowerCase()), ...inlineTags])
      ).filter(Boolean);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId && p.authorId === currentUser.id
            ? {
                ...p,
                content: content.trim(),
                category,
                hashtags: merged,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      addToast({ type: 'success', title: 'Post updated' });
    },
    [currentUser, addToast]
  );

  const deletePost = useCallback(
    (postId: string) => {
      if (!currentUser) return;
      setPosts((prev) =>
        prev.filter((p) => !(p.id === postId && p.authorId === currentUser.id))
      );
      addToast({ type: 'info', title: 'Post deleted' });
    },
    [currentUser, addToast]
  );

  const toggleLikePost = useCallback(
    (postId: string) => {
      if (!currentUser) return;
      const target = posts.find((p) => p.id === postId);
      if (!target) return;
      const alreadyLiked = target.likes.includes(currentUser.id);

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((id) => id !== currentUser.id)
              : Array.from(new Set([...p.likes, currentUser.id])),
          };
        })
      );

      if (!alreadyLiked) {
        pushNotification({
          recipientId: target.authorId,
          actorId: currentUser.id,
          type: NotificationType.LIKE,
          postId: target.id,
          previewText: target.content.slice(0, 72),
        });
      }
    },
    [currentUser, posts, pushNotification]
  );

  const incrementShareCount = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );
  }, []);

  const addComment = useCallback(
    (postId: string, content: string) => {
      if (!currentUser || !content.trim()) return;
      const target = posts.find((p) => p.id === postId);
      if (!target) return;

      const commentId = generateId('comment');
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: commentId,
                    postId,
                    authorId: currentUser.id,
                    content: content.trim(),
                    createdAt: new Date().toISOString(),
                    replies: [],
                  },
                ],
              }
            : p
        )
      );

      pushNotification({
        recipientId: target.authorId,
        actorId: currentUser.id,
        type: NotificationType.COMMENT,
        postId: target.id,
        previewText: content.trim().slice(0, 72),
      });
    },
    [currentUser, posts, pushNotification]
  );

  const deleteComment = useCallback(
    (postId: string, commentId: string) => {
      if (!currentUser) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.filter(
                  (c) => !(c.id === commentId && c.authorId === currentUser.id)
                ),
              }
            : p
        )
      );
      addToast({ type: 'info', title: 'Comment removed' });
    },
    [currentUser, addToast]
  );

  const addReplyToComment = useCallback(
    (postId: string, commentId: string, content: string) => {
      if (!currentUser || !content.trim()) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === commentId
                    ? {
                        ...c,
                        replies: [
                          ...c.replies,
                          {
                            id: generateId('reply'),
                            authorId: currentUser.id,
                            content: content.trim(),
                            createdAt: new Date().toISOString(),
                          },
                        ],
                      }
                    : c
                ),
              }
            : p
        )
      );
    },
    [currentUser]
  );

  const reportPost = useCallback(
    (postId: string, reason: string, details: string) => {
      if (!currentUser) return;
      const record: ReportRecord = {
        id: generateId('report'),
        postId,
        reporterId: currentUser.id,
        reason,
        details,
        createdAt: new Date().toISOString(),
      };
      setReports((prev) => [record, ...prev]);
      addToast({
        type: 'info',
        title: 'Report logged locally',
        description: 'Demo moderation report recorded in your browser.',
      });
    },
    [currentUser, addToast]
  );

  const bookmarkedPostIds = useMemo(() => {
    if (!currentUser) return [];
    return bookmarksMap[currentUser.id] ?? [];
  }, [bookmarksMap, currentUser]);

  const isBookmarked = useCallback(
    (postId: string) => bookmarkedPostIds.includes(postId),
    [bookmarkedPostIds]
  );

  const toggleBookmark = useCallback(
    (postId: string) => {
      if (!currentUser) return;
      const existing = bookmarksMap[currentUser.id] ?? [];
      const has = existing.includes(postId);
      const next = has ? existing.filter((id) => id !== postId) : [postId, ...existing];
      setBookmarksMap((prev) => ({ ...prev, [currentUser.id]: next }));
      addToast({
        type: 'info',
        title: has ? 'Removed from bookmarks' : 'Saved to bookmarks',
      });
    },
    [currentUser, bookmarksMap, addToast]
  );

  // Stories filtered by 24h expiration AND privacy settings
  const visibleStories = useMemo(() => {
    const active = stories.filter((s) => !isStoryExpired(s.expiresAt));
    if (!currentUser) return active.filter((s) => s.privacy === StoryPrivacy.PUBLIC);
    return active.filter((story) => {
      if (story.authorId === currentUser.id) return true;
      if (story.privacy === StoryPrivacy.PUBLIC) return true;
      const author = users.find((u) => u.id === story.authorId);
      if (!author) return false;
      if (story.privacy === StoryPrivacy.FOLLOWERS) {
        return currentUser.following.includes(author.id) || author.followers.includes(currentUser.id);
      }
      if (story.privacy === StoryPrivacy.CLOSE_FRIENDS) {
        return author.closeFriends.includes(currentUser.id);
      }
      return false;
    });
  }, [stories, currentUser, users]);

  const createStory = useCallback(
    (payload: CreateStoryPayload): Story | null => {
      if (!currentUser) return null;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      const story: Story = {
        id: generateId('story'),
        authorId: currentUser.id,
        mediaType: payload.mediaType,
        mediaUrl: payload.mediaUrl,
        imageFit: payload.imageFit || 'cover',
        textOverlay: payload.textOverlay,
        textAlign: payload.textAlign || 'center',
        textSize: payload.textSize || 'md',
        caption: payload.caption,
        backgroundStyle: payload.backgroundStyle,
        privacy: payload.privacy,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        viewedBy: [],
        reactions: [],
        replies: [],
      };
      setStories((prev) => [story, ...prev]);
      addToast({
        type: 'success',
        title: 'Story shared',
        description: 'Visible for 24 hours in your local session.',
      });
      return story;
    },
    [currentUser, addToast]
  );

  const deleteStory = useCallback(
    (storyId: string) => {
      if (!currentUser) return;
      setStories((prev) =>
        prev.filter((s) => !(s.id === storyId && s.authorId === currentUser.id))
      );
      setHighlights((prev) =>
        prev.map((h) => ({
          ...h,
          storyIds: h.storyIds.filter((id) => id !== storyId),
        }))
      );
      addToast({ type: 'info', title: 'Story deleted' });
    },
    [currentUser, addToast]
  );

  const markStoryViewed = useCallback(
    (storyId: string) => {
      if (!currentUser) return;
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId && !s.viewedBy.includes(currentUser.id)
            ? { ...s, viewedBy: [...s.viewedBy, currentUser.id] }
            : s
        )
      );
    },
    [currentUser]
  );

  const reactToStory = useCallback(
    (storyId: string, emoji: string) => {
      if (!currentUser) return;
      const target = stories.find((s) => s.id === storyId);
      if (!target) return;

      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? {
                ...s,
                reactions: [
                  ...s.reactions.filter((r) => r.userId !== currentUser.id),
                  { userId: currentUser.id, emoji, createdAt: new Date().toISOString() },
                ],
              }
            : s
        )
      );

      addToast({ type: 'success', title: `Reacted with ${emoji}` });
    },
    [currentUser, stories, addToast]
  );

  const createHighlight = useCallback(
    (payload: CreateHighlightPayload): StoryHighlight | null => {
      if (!currentUser) return null;
      const created: StoryHighlight = {
        id: generateId('hl'),
        userId: currentUser.id,
        title: payload.title.trim(),
        coverUrl: payload.coverUrl,
        storyIds: payload.storyIds,
        createdAt: new Date().toISOString(),
      };
      setHighlights((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Highlight created',
        description: `"${created.title}" added to your profile.`,
      });
      return created;
    },
    [currentUser, addToast]
  );

  const updateHighlight = useCallback(
    (highlightId: string, payload: CreateHighlightPayload) => {
      if (!currentUser) return;
      setHighlights((prev) =>
        prev.map((h) =>
          h.id === highlightId && h.userId === currentUser.id
            ? {
                ...h,
                title: payload.title.trim(),
                coverUrl: payload.coverUrl,
                storyIds: payload.storyIds,
              }
            : h
        )
      );
      addToast({ type: 'success', title: 'Highlight updated' });
    },
    [currentUser, addToast]
  );

  const deleteHighlight = useCallback(
    (highlightId: string) => {
      if (!currentUser) return;
      setHighlights((prev) =>
        prev.filter((h) => !(h.id === highlightId && h.userId === currentUser.id))
      );
      if (activeHighlightId === highlightId) {
        setActiveHighlightId(null);
      }
      addToast({ type: 'info', title: 'Highlight deleted' });
    },
    [currentUser, activeHighlightId, addToast]
  );

  const startOrGetConversation = useCallback(
    (otherUserId: string): Conversation | null => {
      if (!currentUser || currentUser.id === otherUserId) return null;
      const existing = conversations.find(
        (c) =>
          c.participantIds.includes(currentUser.id) &&
          c.participantIds.includes(otherUserId)
      );
      if (existing) return existing;

      const created: Conversation = {
        id: generateId('conv'),
        participantIds: [currentUser.id, otherUserId],
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [created, ...prev]);
      return created;
    },
    [currentUser, conversations]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!currentUser || !text.trim()) return;
      const msg: Message = {
        id: generateId('msg'),
        conversationId,
        senderId: currentUser.id,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, updatedAt: msg.createdAt } : c
        )
      );
    },
    [currentUser]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!currentUser) return;
      setMessages((prev) =>
        prev.filter((m) => !(m.id === messageId && m.senderId === currentUser.id))
      );
    },
    [currentUser]
  );

  const replyToStory = useCallback(
    (storyId: string, text: string) => {
      if (!currentUser || !text.trim()) return;
      const target = stories.find((s) => s.id === storyId);
      if (!target) return;

      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? {
                ...s,
                replies: [
                  ...s.replies,
                  {
                    id: generateId('sreply'),
                    userId: currentUser.id,
                    text: text.trim(),
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : s
        )
      );

      if (target.authorId !== currentUser.id) {
        pushNotification({
          recipientId: target.authorId,
          actorId: currentUser.id,
          type: NotificationType.STORY_REPLY,
          storyId: target.id,
          previewText: text.trim().slice(0, 72),
        });
        const conv = startOrGetConversation(target.authorId);
        if (conv) {
          sendMessage(conv.id, `Replied to your story: "${text.trim()}"`);
        }
      }

      addToast({ type: 'success', title: 'Story reply sent' });
    },
    [currentUser, stories, pushNotification, startOrGetConversation, sendMessage, addToast]
  );

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications
      .filter((n) => n.recipientId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, currentUser]);

  const unreadNotificationCount = useMemo(
    () => userNotifications.filter((n) => !n.read).length,
    [userNotifications]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.recipientId === currentUser.id ? { ...n, read: true } : n
      )
    );
  }, [currentUser]);

  const clearNotifications = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.filter((n) => n.recipientId !== currentUser.id)
    );
    addToast({ type: 'info', title: 'Notifications cleared' });
  }, [currentUser, addToast]);

  const toggleJoinCommunity = useCallback(
    (communityId: string) => {
      if (!currentUser) return;
      const target = communities.find((c) => c.id === communityId);
      if (!target) return;
      const isMember = target.memberIds.includes(currentUser.id);

      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? {
                ...c,
                memberIds: isMember
                  ? c.memberIds.filter((id) => id !== currentUser.id)
                  : [...c.memberIds, currentUser.id],
              }
            : c
        )
      );

      addToast({
        type: 'info',
        title: isMember ? `Left ${target.name}` : `Joined ${target.name}`,
      });
    },
    [currentUser, communities, addToast]
  );

  const addRecentSearch = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setRecentSearches((prev) =>
      [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8)
    );
  }, []);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== query));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const updateSettings = useCallback(
    (updater: (prev: AppSettings) => AppSettings) => {
      setSettings((prev) => updater(prev));
    },
    []
  );

  const resetDemoData = useCallback(async () => {
    storage.clearAllNexoraData();
    await clearMediaDB();
    const seed = createSeedData();
    storage.saveUsers(seed.users);
    storage.savePosts(seed.posts);
    storage.saveStories(seed.stories);
    storage.saveHighlights(seed.highlights);
    storage.saveCommunities(seed.communities);
    storage.saveNotifications(seed.notifications);
    storage.saveConversations(seed.conversations);
    storage.saveMessages(seed.messages);
    storage.saveBookmarksMap(seed.bookmarksMap);
    storage.saveSettings(DEFAULT_SETTINGS);
    storage.saveRecentSearches(['#DesignSystems', 'maya.lin', 'React Developers']);
    storage.markSeeded();

    setUsers(seed.users);
    setPosts(seed.posts);
    setStories(seed.stories);
    setHighlights(seed.highlights);
    setCommunities(seed.communities);
    setNotifications(seed.notifications);
    setConversations(seed.conversations);
    setMessages(seed.messages);
    setBookmarksMap(seed.bookmarksMap);
    setSettings(DEFAULT_SETTINGS);
    setRecentSearches(['#DesignSystems', 'maya.lin', 'React Developers']);
    setReports([]);
    setSessionUserId('user_alex');
    storage.setSessionUserId('user_alex');

    addToast({
      type: 'success',
      title: 'Demo data restored',
      description: 'Reset to initial sample creators, posts, stories, highlights, and conversations.',
    });
  }, [addToast]);

  const value: NexoraContextValue = {
    currentUser,
    users,
    posts,
    stories,
    highlights,
    notifications,
    conversations,
    messages,
    communities,
    bookmarkedPostIds,
    settings,
    recentSearches,
    toasts,
    activeStoryUserId,
    activeHighlightId,
    isCreatePostOpen,
    isCreateStoryOpen,
    setActiveStoryUserId,
    setActiveHighlightId,
    setCreatePostOpen,
    setCreateStoryOpen,
    addToast,
    dismissToast,
    login,
    loginDemo,
    register,
    logout,
    isUsernameAvailable,
    getUserById,
    getUserByUsername,
    toggleFollow,
    toggleCloseFriend,
    updateProfile,
    changePasswordDemo,
    createPost,
    editPost,
    deletePost,
    toggleLikePost,
    incrementShareCount,
    addComment,
    deleteComment,
    addReplyToComment,
    reportPost,
    toggleBookmark,
    isBookmarked,
    visibleStories,
    createStory,
    deleteStory,
    markStoryViewed,
    reactToStory,
    replyToStory,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    userNotifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    startOrGetConversation,
    sendMessage,
    deleteMessage,
    toggleJoinCommunity,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    updateSettings,
    resetDemoData,
  };

  return <NexoraContext.Provider value={value}>{children}</NexoraContext.Provider>;
}

export function useNexora(): NexoraContextValue {
  const ctx = useContext(NexoraContext);
  if (!ctx) {
    throw new Error('useNexora must be used inside NexoraProvider');
  }
  return ctx;
}
