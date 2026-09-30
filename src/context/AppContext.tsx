import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Post,
  PostPrivacy,
  Conversation,
  MessageItem,
  normalizeMessage,
  NotificationItem,
  GroupItem,
  PageItem,
  SavedCollection,
  ThemeMode,
  AppRoute,
  ActiveSession,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_FRIENDS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_GROUPS,
  INITIAL_PAGES,
  INITIAL_COLLECTIONS,
  ACTIVE_SESSIONS,
} from '../services/mockData';
import api, { onRateLimitExceeded } from '../services/api';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface AppContextType {
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;

  // Navigation
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  routeParams: Record<string, string>;

  // Auth & Profile
  currentUser: User;
  isLoggedIn: boolean;
  login: (emailOrUser: string, userObj?: Partial<User>) => void;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;

  // Posts
  posts: Post[];
  createPost: (content: string, options?: { mediaUrl?: string; privacy?: Post['privacy']; feeling?: string; location?: string; hashtags?: string[] }) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deletePost: (postId: string) => void;
  editPost: (postId: string, newContent: string) => void;

  // Social
  friends: User[];
  toggleFollow: (userId: string) => void;
  acceptFriendRequest: (userId: string) => void;
  rejectFriendRequest: (userId: string) => void;

  // Messaging
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  openDirectConversation: (user: { id: string | number; name?: string; username?: string; avatar?: string }) => Promise<string | null>;
  sendMessage: (text: string, mediaUrl?: string) => void;
  isPartnerTyping: boolean;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Groups & Pages
  groups: GroupItem[];
  toggleJoinGroup: (id: string) => void;
  pages: PageItem[];
  toggleFollowPage: (id: string) => void;

  // Collections
  collections: SavedCollection[];
  createCollection: (name: string, description: string, privacy: 'Public' | 'Private') => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchHistory: string[];
  addSearchHistory: (q: string) => void;
  clearSearchHistory: () => void;

  // Sessions
  sessions: ActiveSession[];
  logoutOtherSessions: () => void;

  // Density & Settings
  density: 'comfortable' | 'compact';
  setDensity: (d: 'comfortable' | 'compact') => void;
  privacySettings: {
    visibility: string;
    whoCanFollow: string;
    whoCanMessage: string;
    whoCanComment: string;
    whoCanMention: string;
  };
  updatePrivacySettings: (key: string, val: string) => void;
  notifSettings: Record<string, boolean>;
  updateNotifSetting: (key: string, val: boolean) => void;

  // UI Dialogs & Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  confirmDialog: ConfirmDialogOptions | null;
  showConfirmDialog: (options: ConfirmDialogOptions) => void;
  closeConfirmDialog: () => void;
  shareModalPost: Post | null;
  setShareModalPost: (p: Post | null) => void;
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state - OBSIDIAN GRAPHITE by default
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nexora_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexora_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode);
  };

  // Route & Navigation
  const [route, setRouteState] = useState<AppRoute>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash && [
      'landing', 'login', 'signup', 'verify-otp', 'forgot-password',
      'home', 'feed', 'explore', 'profile', 'friends', 'messages',
      'notifications', 'bookmarks', 'groups', 'group-details', 'pages',
      'insights', 'search', 'settings', 'help', 'about', 'contact', 'faq'
    ].includes(hash)) {
      return hash as AppRoute;
    }
    return 'home';
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  const navigate = (newRoute: AppRoute, params?: Record<string, string>) => {
    setRouteState(newRoute);
    if (params) setRouteParams(params);
    window.location.hash = `#/${newRoute}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setRoute = (r: AppRoute) => {
    navigate(r);
  };

  // Listen to hash change for browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && hash !== route) {
        setRouteState((hash as AppRoute) || 'home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [route]);

  // Current user & auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('nexora_logged_in');
    return stored !== null ? stored === 'true' : true;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const stored = localStorage.getItem('nexora_profile');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return CURRENT_USER;
  });

  // Messaging state
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv_priya');
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);

  // Listen for global rate limiting events (HTTP 429)
  useEffect(() => {
    const unsubscribe = onRateLimitExceeded(({ message, retryAfter }) => {
      showToast(message || `Rate limit reached. Please wait ${retryAfter || 60} seconds.`, 'error');
    });
    return unsubscribe;
  }, []);

  // Sync user profile, default session, and feed on mount
  useEffect(() => {
    let isCancelled = false;

    const initApp = async () => {
      let token = api.getToken();
      if (!token) {
        // Auto-initialize default session so all actions & WebSocket work immediately
        try {
          const sessionRes = await api.ensureDefaultSession();
          if (sessionRes.status === 200 && sessionRes.data?.token) {
            token = sessionRes.data.token;
          }
        } catch (_) {}
      }

      if (token && !isCancelled) {
        api.connectWebSocket();
        api
          .getCurrentUser()
          .then((res) => {
            if (!isCancelled && res.status === 200 && res.data) {
              const u = res.data;
              setCurrentUser((prev) => {
                const updated: User = {
                  ...prev,
                  id: String(u.id),
                  name: u.name || u.displayName || u.username || 'User',
                  username: u.username,
                  email: u.email,
                  avatar: u.avatar || prev.avatar,
                  bio: u.bio !== undefined ? u.bio : prev.bio,
                  location: u.location !== undefined ? u.location : prev.location,
                  website: u.website !== undefined ? u.website : prev.website,
                  work: u.work !== undefined ? u.work : prev.work,
                  education: u.education !== undefined ? u.education : prev.education,
                  role: u.role,
                  isVerified: u.verified ?? prev.isVerified,
                  followersCount: typeof u.followersCount === 'number' ? u.followersCount : prev.followersCount,
                  followingCount: typeof u.followingCount === 'number' ? u.followingCount : prev.followingCount,
                  postsCount: typeof u.postsCount === 'number' ? u.postsCount : prev.postsCount,
                };
                localStorage.setItem('nexora_profile', JSON.stringify(updated));
                return updated;
              });
            }
          })
          .catch(console.error);

        // Load real conversations
        api
          .getConversations()
          .then((res) => {
            const data = res.data;
            if (!isCancelled && res.status === 200 && Array.isArray(data) && data.length > 0) {
              setConversations((prev) => {
                const loaded = data.map((c: any) => ({
                  id: String(c.id),
                  participant: {
                    id: String(c.participant?.id || c.id),
                    name: c.participant?.name || 'User',
                    username: c.participant?.username || '',
                    avatar: c.participant?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                    isOnline: Boolean(c.participant?.isOnline),
                    lastSeen: c.participant?.lastSeen || 'Recently',
                  },
                  lastMessage: c.lastMessage || '',
                  timestamp: c.timestamp || 'Just now',
                  unreadCount: c.unreadCount || 0,
                  messages: Array.isArray(c.messages)
                    ? c.messages.map((m: any) => normalizeMessage(m, String(c.id)))
                    : [],
                }));

                const loadedIds = new Set(loaded.map((c: any) => c.id));
                const remaining = prev.filter((c) => !loadedIds.has(c.id));
                return [...loaded, ...remaining];
              });
            }
          })
          .catch(console.error);
      }

      // Load real posts and merge with local user-created posts so posts with photos are NEVER removed!
      api
        .getFeed(0, 50)
        .then((res) => {
          const data = res.data;
          if (!isCancelled && res.status === 200 && Array.isArray(data) && data.length > 0) {
            const serverPosts: Post[] = data.map((p: any) => ({
              id: String(p.id),
              author: {
                id: String(p.author?.id),
                name: p.author?.name || p.author?.username,
                username: p.author?.username,
                avatar: p.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                isVerified: Boolean(p.author?.isVerified),
              },
              content: p.content,
              timestamp: p.timestamp || 'Recently',
              privacy: (p.privacy || 'public').toLowerCase() as PostPrivacy,
              hashtags: (p.content.match(/#[a-zA-Z0-9_]+/g) || []).map((h: string) => h.replace('#', '')),
              mediaUrl: p.mediaUrl || undefined,
              mediaType: p.mediaType || (p.mediaUrl ? 'image' : undefined),
              likesCount: Number(p.likesCount) || 0,
              commentsCount: Number(p.commentsCount) || 0,
              sharesCount: 0,
              isLiked: Boolean(p.isLiked),
              isSaved: Boolean(p.isSaved),
              comments: p.comments || [],
            }));

            setPosts((prev) => {
              const serverIds = new Set(serverPosts.map((sp) => sp.id));
              // Retain any pending posts or local posts created by user that aren't yet in server feed
              const pendingLocal = prev.filter(
                (lp) =>
                  !serverIds.has(lp.id) &&
                  (lp.id.startsWith('post_') || lp.author.username === currentUser.username)
              );
              return [...pendingLocal, ...serverPosts];
            });
          }
        })
        .catch(console.error);
    };

    initApp();

    return () => {
      isCancelled = true;
    };
  }, []);

  // WebSocket real-time incoming message and status handler
  useEffect(() => {
    const unsubscribe = api.onWebSocketMessage((data) => {
      if (data.type === 'new_message' && data.message) {
        const convId = String(data.conversationId);
        const normMsg = normalizeMessage(data.message, convId);

        setConversations((prev) => {
          const exists = prev.some((c) => c.id === convId);
          if (exists) {
            return prev.map((c) => {
              if (c.id === convId) {
                const alreadyExists = c.messages.some(
                  (m) =>
                    String(m.id) === String(normMsg.id) ||
                    (m.clientMessageId && normMsg.clientMessageId && m.clientMessageId === normMsg.clientMessageId)
                );
                if (alreadyExists) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      String(m.id) === String(normMsg.id) ||
                      (m.clientMessageId && normMsg.clientMessageId && m.clientMessageId === normMsg.clientMessageId)
                        ? normMsg
                        : m
                    ),
                  };
                }

                return {
                  ...c,
                  lastMessage: normMsg.text || (normMsg.mediaUrl ? 'Photo Attachment' : ''),
                  timestamp: normMsg.timestamp,
                  messages: [...c.messages, normMsg],
                };
              }
              return c;
            });
          } else {
            const senderName = normMsg.senderDisplayName || normMsg.senderUsername || 'User';
            const senderAvatar =
              normMsg.senderAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
            const newConv: Conversation = {
              id: convId,
              participant: {
                id: normMsg.senderId,
                name: senderName,
                username: normMsg.senderUsername || '',
                avatar: senderAvatar,
                isOnline: true,
                lastSeen: 'Active now',
              },
              lastMessage: normMsg.text || (normMsg.mediaUrl ? 'Photo Attachment' : ''),
              timestamp: normMsg.timestamp,
              unreadCount: 1,
              messages: [normMsg],
            };
            return [newConv, ...prev];
          }
        });

        if (normMsg.senderId !== String(currentUser.id)) {
          showToast(`New message from ${normMsg.senderDisplayName || 'User'}`, 'info');
        }
      }

      if (data.type === 'message_delivered') {
        const { messageId, conversationId } = data;
        setConversations((prev) =>
          prev.map((c) => {
            if (String(c.id) === String(conversationId)) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  String(m.id) === String(messageId) ? { ...m, status: 'delivered' } : m
                ),
              };
            }
            return c;
          })
        );
      }

      if (data.type === 'messages_read') {
        const { conversationId } = data;
        setConversations((prev) =>
          prev.map((c) => {
            if (String(c.id) === String(conversationId)) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.senderId === String(currentUser.id) ? { ...m, status: 'read' } : m
                ),
              };
            }
            return c;
          })
        );
      }

      if (data.type === 'typing') {
        if (String(data.conversationId) === String(activeConversationId)) {
          setIsPartnerTyping(Boolean(data.isTyping));
        }
      }
    });

    return unsubscribe;
  }, [activeConversationId, currentUser.id]);

  const login = (emailOrUser: string, userObj?: Partial<User>) => {
    setIsLoggedIn(true);
    localStorage.setItem('nexora_logged_in', 'true');

    if (userObj) {
      setCurrentUser((prev) => {
        const merged: User = {
          ...prev,
          ...userObj,
          id: String(userObj.id || prev.id),
          name: userObj.name || prev.name,
          username: userObj.username || prev.username,
          avatar: userObj.avatar || prev.avatar,
          followersCount: typeof userObj.followersCount === 'number' ? userObj.followersCount : prev.followersCount,
          followingCount: typeof userObj.followingCount === 'number' ? userObj.followingCount : prev.followingCount,
          postsCount: typeof userObj.postsCount === 'number' ? userObj.postsCount : prev.postsCount,
        };
        localStorage.setItem('nexora_profile', JSON.stringify(merged));
        return merged;
      });
    }

    // Connect WebSocket and fetch fresh feed & profile
    api.connectWebSocket();
    api.getFeed(0, 30).then((res) => {
      if (res.status === 200 && res.data && res.data.length > 0) {
        setPosts(res.data.map((p: any) => ({
          id: String(p.id),
          author: {
            id: String(p.author?.id),
            name: p.author?.name || p.author?.username,
            username: p.author?.username,
            avatar: p.author?.avatar,
            isVerified: Boolean(p.author?.isVerified),
          },
          content: p.content,
          timestamp: p.timestamp || 'Recently',
          privacy: (p.privacy || 'public').toLowerCase() as PostPrivacy,
          hashtags: (p.content.match(/#[a-zA-Z0-9_]+/g) || []).map((h: string) => h.replace('#', '')),
          mediaUrl: p.mediaUrl || undefined,
          mediaType: p.mediaType || (p.mediaUrl ? 'image' : undefined),
          likesCount: Number(p.likesCount) || 0,
          commentsCount: Number(p.commentsCount) || 0,
          sharesCount: 0,
          isLiked: Boolean(p.isLiked),
          isSaved: Boolean(p.isSaved),
          comments: p.comments || [],
        })));
      }
    }).catch(console.error);

    const displayName = userObj?.name || emailOrUser.split('@')[0] || 'User';
    showToast(`Welcome back, ${displayName}!`, 'success');
    navigate('home');
  };

  const logout = () => {
    api.logout();
    setIsLoggedIn(false);
    localStorage.setItem('nexora_logged_in', 'false');
    showToast('You have been logged out.', 'info');
    navigate('landing');
  };

  const updateProfile = async (updated: Partial<User>) => {
    setCurrentUser((prev) => {
      const neu = { ...prev, ...updated };
      localStorage.setItem('nexora_profile', JSON.stringify(neu));
      return neu;
    });

    try {
      await api.updateProfile({
        displayName: updated.name,
        bio: updated.bio,
        location: updated.location,
        website: updated.website,
        work: updated.work,
        education: updated.education,
        interests: updated.interests,
      });
    } catch (e) {
      console.error('Failed to sync profile with database:', e);
    }

    showToast('Profile updated successfully!', 'success');
  };

  // Posts state
  const [posts, setPosts] = useState<Post[]>(() => {
    const stored = localStorage.getItem('nexora_posts');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_POSTS;
  });

  useEffect(() => {
    localStorage.setItem('nexora_posts', JSON.stringify(posts));
  }, [posts]);

  const createPost = async (
    content: string,
    options?: { mediaUrl?: string; privacy?: Post['privacy']; feeling?: string; location?: string; hashtags?: string[] }
  ) => {
    const tempId = `post_${Date.now()}`;
    const newPost: Post = {
      id: tempId,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      content,
      timestamp: 'Just now',
      privacy: options?.privacy || 'public',
      hashtags: options?.hashtags || [],
      mediaUrl: options?.mediaUrl,
      mediaType: options?.mediaUrl ? 'image' : undefined,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      feeling: options?.feeling,
      location: options?.location,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setCurrentUser((prev) => ({ ...prev, postsCount: prev.postsCount + 1 }));

    // Send to Neon PostgreSQL
    try {
      const res = await api.createPost({
        content,
        mediaUrl: options?.mediaUrl,
        visibility: (options?.privacy || 'PUBLIC').toUpperCase(),
      });
      if (res.status === 201 && res.data) {
        const realId = String(res.data.id);
        setPosts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: realId } : p))
        );
      }
    } catch (err) {
      console.error('Failed to persist post:', err);
    }

    showToast('Post published to your feed!', 'success');
  };

  const toggleLike = async (postId: string) => {
    let willLike = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          willLike = isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    try {
      if (willLike) {
        await api.likePost(postId);
      } else {
        await api.unlikePost(postId);
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const toggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isSaved = !p.isSaved;
          showToast(isSaved ? 'Post saved to Bookmarks' : 'Removed from Bookmarks', 'info');
          return { ...p, isSaved };
        }
        return p;
      })
    );
  };

  const addComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    const tempCommentId = `c_${Date.now()}`;
    const newComment = {
      id: tempCommentId,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      content: text.trim(),
      timestamp: 'Just now',
      likesCount: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    // Persist comment in Neon PostgreSQL
    try {
      const res = await api.addComment(postId, text.trim());
      if (res.status === 201 && res.data) {
        const realCommentId = String(res.data.id);
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === tempCommentId ? { ...c, id: realCommentId } : c
                ),
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error('Failed to save comment:', err);
    }

    showToast('Comment posted', 'success');
  };

  const deletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setCurrentUser((prev) => ({ ...prev, postsCount: Math.max(0, prev.postsCount - 1) }));

    try {
      await api.deletePost(postId);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }

    showToast('Post removed', 'info');
  };

  const editPost = (postId: string, newContent: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, content: newContent };
        }
        return p;
      })
    );
    showToast('Post updated successfully', 'success');
  };

  // Friends & Social
  const [friends, setFriends] = useState<User[]>(INITIAL_FRIENDS);

  const toggleFollow = async (userId: string) => {
    let currentlyFollowing = false;
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === userId) {
          currentlyFollowing = f.isFollowing || false;
          const isFollowing = !currentlyFollowing;
          showToast(isFollowing ? `Following ${f.name}` : `Unfollowed ${f.name}`, 'info');
          return {
            ...f,
            isFollowing,
            followersCount: isFollowing ? f.followersCount + 1 : Math.max(0, f.followersCount - 1),
          };
        }
        return f;
      })
    );

    // Call Neon DB Follow API
    try {
      if (!currentlyFollowing) {
        const res = await api.followUser(userId);
        if (res.status === 200 && res.data) {
          setCurrentUser((prev) => ({
            ...prev,
            followingCount: res.data.myFollowingCount ?? prev.followingCount + 1,
          }));
        }
      } else {
        const res = await api.unfollowUser(userId);
        if (res.status === 200 && res.data) {
          setCurrentUser((prev) => ({
            ...prev,
            followingCount: res.data.myFollowingCount ?? Math.max(0, prev.followingCount - 1),
          }));
        }
      }
    } catch (err: any) {
      console.error('Follow error:', err);
      showToast(err.message || 'Follow operation failed.', 'error');
    }
  };

  const acceptFriendRequest = (userId: string) => {
    showToast('Friend request accepted', 'success');
    setFriends((prev) =>
      prev.map((f) => (f.id === userId ? { ...f, isFollowing: true } : f))
    );
  };

  const rejectFriendRequest = (_userId: string) => {
    showToast('Friend request declined', 'info');
  };

  const openDirectConversation = async (participantUser: {
    id: string | number;
    name?: string;
    username?: string;
    avatar?: string;
  }): Promise<string | null> => {
    const targetId = String(participantUser.id);
    const targetName = participantUser.name || participantUser.username || `User ${targetId}`;
    const targetUsername = participantUser.username || `user_${targetId}`;
    const targetAvatar = participantUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    try {
      let convId = `conv_${targetId}`;
      const res = await api.createConversation(targetId);
      if (res.status === 200 && res.data?.conversationId) {
        convId = String(res.data.conversationId);
      }

      setConversations((prev) => {
        const existing = prev.find(
          (c) =>
            c.id === convId ||
            String(c.participant?.id) === targetId ||
            (targetUsername && c.participant?.username?.toLowerCase() === targetUsername.toLowerCase())
        );
        if (existing) {
          if (existing.id !== convId) {
            return prev.map((c) => (c === existing ? { ...c, id: convId } : c));
          }
          return prev;
        }

        const newConv: Conversation = {
          id: convId,
          participant: {
            id: targetId,
            name: targetName,
            username: targetUsername,
            avatar: targetAvatar,
            isOnline: true,
            lastSeen: 'Active now',
          },
          lastMessage: 'Conversation opened',
          timestamp: 'Just now',
          unreadCount: 0,
          messages: [],
        };
        return [newConv, ...prev];
      });

      setActiveConversationId(convId);
      return convId;
    } catch (err: any) {
      console.warn('Fallback direct conversation initialization:', err);
      const fallbackId = `conv_${targetId}`;
      setConversations((prev) => {
        const existing = prev.find(
          (c) => c.id === fallbackId || String(c.participant?.id) === targetId
        );
        if (existing) return prev;
        return [
          {
            id: fallbackId,
            participant: {
              id: targetId,
              name: targetName,
              username: targetUsername,
              avatar: targetAvatar,
              isOnline: true,
              lastSeen: 'Active now',
            },
            lastMessage: 'Conversation opened',
            timestamp: 'Just now',
            unreadCount: 0,
            messages: [],
          },
          ...prev,
        ];
      });
      setActiveConversationId(fallbackId);
      return fallbackId;
    }
  };

  const sendMessage = async (text: string, mediaUrl?: string) => {
    const trimmed = (text || '').trim();
    if ((!trimmed && !mediaUrl) || !activeConversationId) return;

    const tempId = `msg_${Date.now()}`;
    const newMsg = normalizeMessage(
      {
        id: tempId,
        conversationId: activeConversationId,
        senderId: String(currentUser.id),
        senderUsername: currentUser.username,
        senderDisplayName: currentUser.name,
        senderAvatarUrl: currentUser.avatar,
        content: trimmed,
        text: trimmed,
        mediaUrl,
        messageType: mediaUrl ? 'image' : 'text',
        status: 'sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      activeConversationId
    );

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            lastMessage: trimmed || (mediaUrl ? 'Photo Attachment' : ''),
            timestamp: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Send via real-time WebSocket and reliable fallback
    try {
      const res = await api.sendChatMessage(activeConversationId, trimmed, mediaUrl);
      if (res && res.status === 201 && res.data) {
        const persistedMsg = normalizeMessage(res.data, activeConversationId);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConversationId) {
              return {
                ...c,
                messages: c.messages.map((m) => (m.id === tempId ? { ...persistedMsg, status: 'sent' } : m)),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }

    // Simulate partner response for demo conversations
    if (activeConversationId.startsWith('conv_')) {
      setTimeout(() => {
        setIsPartnerTyping(true);
        setTimeout(() => {
          setIsPartnerTyping(false);
          const replyMsg = normalizeMessage(
            {
              id: `reply_${Date.now()}`,
              conversationId: activeConversationId,
              senderId: 'partner',
              content: 'Got it! Looking over it now. Really appreciate the fast turnaround! 👍',
              text: 'Got it! Looking over it now. Really appreciate the fast turnaround! 👍',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read',
            },
            activeConversationId
          );
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConversationId) {
                return {
                  ...c,
                  lastMessage: replyMsg.text,
                  timestamp: 'Just now',
                  messages: [...c.messages, replyMsg],
                };
              }
              return c;
            })
          );
        }, 1200);
      }, 600);
    }
  };

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Groups & Pages
  const [groups, setGroups] = useState<GroupItem[]>(INITIAL_GROUPS);
  const toggleJoinGroup = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const isJoined = !g.isJoined;
          showToast(isJoined ? `Joined group: ${g.name}` : `Left group: ${g.name}`, 'info');
          return {
            ...g,
            isJoined,
            membersCount: isJoined ? g.membersCount + 1 : g.membersCount - 1,
          };
        }
        return g;
      })
    );
  };

  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);
  const toggleFollowPage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isFollowing = !p.isFollowing;
          showToast(isFollowing ? `Following ${p.name}` : `Unfollowed ${p.name}`, 'info');
          return {
            ...p,
            isFollowing,
            followersCount: isFollowing ? p.followersCount + 1 : p.followersCount - 1,
          };
        }
        return p;
      })
    );
  };

  // Saved Collections
  const [collections, setCollections] = useState<SavedCollection[]>(INITIAL_COLLECTIONS);
  const createCollection = (name: string, description: string, privacy: 'Public' | 'Private') => {
    const neu: SavedCollection = {
      id: `col_${Date.now()}`,
      name,
      description,
      privacy,
      postIds: [],
      updatedAt: 'Just now',
    };
    setCollections((prev) => [neu, ...prev]);
    showToast(`Created collection "${name}"`, 'success');
  };

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'Web performance',
    'React 19',
    'Design tokens',
    'Alex Chen',
  ]);

  const addSearchHistory = (q: string) => {
    if (!q.trim()) return;
    setSearchHistory((prev) => [q, ...prev.filter((item) => item !== q)].slice(0, 8));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    showToast('Search history cleared', 'info');
  };

  // Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>(ACTIVE_SESSIONS);
  const logoutOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast('Logged out of all other devices', 'success');
  };

  // Density & Settings
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [privacySettings, setPrivacySettings] = useState({
    visibility: 'Everyone',
    whoCanFollow: 'Everyone',
    whoCanMessage: 'Friends',
    whoCanComment: 'Everyone',
    whoCanMention: 'Friends',
  });

  const updatePrivacySettings = (key: string, val: string) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: val }));
    showToast('Privacy preference saved', 'info');
  };

  const [notifSettings, setNotifSettings] = useState<Record<string, boolean>>({
    likes: true,
    comments: true,
    followers: true,
    messages: true,
    mentions: true,
    groups: false,
    emailDigest: true,
  });

  const updateNotifSetting = (key: string, val: boolean) => {
    setNotifSettings((prev) => ({ ...prev, [key]: val }));
    showToast('Notification preference updated', 'info');
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const showConfirmDialog = (opts: ConfirmDialogOptions) => setConfirmDialog(opts);
  const closeConfirmDialog = () => setConfirmDialog(null);

  // Modals & Image Preview
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeMode,
        route,
        setRoute,
        navigate,
        routeParams,
        currentUser,
        isLoggedIn,
        login,
        logout,
        updateProfile,
        posts,
        createPost,
        toggleLike,
        toggleSave,
        addComment,
        deletePost,
        editPost,
        friends,
        toggleFollow,
        acceptFriendRequest,
        rejectFriendRequest,
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversationId,
        openDirectConversation,
        sendMessage,
        isPartnerTyping,
        notifications,
        unreadNotifCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        groups,
        toggleJoinGroup,
        pages,
        toggleFollowPage,
        collections,
        createCollection,
        searchQuery,
        setSearchQuery,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
        sessions,
        logoutOtherSessions,
        density,
        setDensity,
        privacySettings,
        updatePrivacySettings,
        notifSettings,
        updateNotifSetting,
        toasts,
        showToast,
        removeToast,
        confirmDialog,
        showConfirmDialog,
        closeConfirmDialog,
        shareModalPost,
        setShareModalPost,
        previewImage,
        setPreviewImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
