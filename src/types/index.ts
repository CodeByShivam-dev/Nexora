export type ThemeMode = 'light' | 'dark';

export type PostPrivacy = 'public' | 'friends' | 'only_me';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  coverImage?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  role?: string;
  joinedDate?: string;
  isVerified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  work?: string;
  education?: string;
  interests?: string[];
  isFollowing?: boolean;
  distanceKm?: number;
  mutualFriends?: number;
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  timestamp: string;
  privacy: PostPrivacy;
  hashtags?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
  feeling?: string;
  location?: string;
}

export interface MessageItem {
  id: string;
  conversationId?: string;
  clientMessageId?: string;
  senderId: string;
  senderUsername?: string;
  senderDisplayName?: string;
  senderAvatarUrl?: string;
  content?: string;
  text: string;
  mediaUrl?: string;
  messageType?: string;
  timestamp: string;
  createdAt?: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  status: 'sent' | 'delivered' | 'read';
  sender?: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
}

export function normalizeMessage(raw: any, fallbackConversationId?: string): MessageItem {
  const senderId = String(
    raw?.senderId ??
    raw?.sender_id ??
    raw?.sender?.id ??
    raw?.userId ??
    ''
  );

  const senderUsername = String(
    raw?.senderUsername ||
    raw?.sender_username ||
    raw?.sender?.username ||
    ''
  );

  const senderDisplayName = String(
    raw?.senderDisplayName ||
    raw?.sender_name ||
    raw?.sender_display_name ||
    raw?.sender?.name ||
    raw?.sender?.displayName ||
    senderUsername ||
    'User'
  );

  const senderAvatarUrl = String(
    raw?.senderAvatarUrl ||
    raw?.sender_avatar ||
    raw?.sender_avatar_url ||
    raw?.sender?.avatar ||
    ''
  );

  const contentText = String(raw?.text ?? raw?.content ?? '');

  const timestamp = raw?.timestamp || (raw?.createdAt || raw?.created_at
    ? new Date(raw.createdAt || raw.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now');

  const status: 'sent' | 'delivered' | 'read' =
    raw?.status === 'read' || raw?.readAt || raw?.read_at
      ? 'read'
      : raw?.status === 'delivered' || raw?.deliveredAt || raw?.delivered_at
      ? 'delivered'
      : 'sent';

  return {
    id: String(raw?.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    conversationId: String(raw?.conversationId || raw?.conversation_id || fallbackConversationId || ''),
    clientMessageId: raw?.clientMessageId || raw?.client_message_id,
    senderId,
    senderUsername,
    senderDisplayName,
    senderAvatarUrl,
    content: contentText,
    text: contentText,
    mediaUrl: raw?.mediaUrl || raw?.media_url,
    messageType: raw?.messageType || raw?.message_type || 'text',
    timestamp,
    createdAt: raw?.createdAt || raw?.created_at,
    deliveredAt: raw?.deliveredAt || raw?.delivered_at || null,
    readAt: raw?.readAt || raw?.read_at || null,
    status,
    sender: {
      id: senderId,
      name: senderDisplayName,
      username: senderUsername,
      avatar: senderAvatarUrl,
    },
  };
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: MessageItem[];
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'message' | 'group' | 'system';
  actor: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  targetTitle?: string;
  targetId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface GroupItem {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage: string;
  membersCount: number;
  privacy: 'Public' | 'Private';
  category: string;
  isJoined: boolean;
}

export interface PageItem {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  category: string;
  followersCount: number;
  isFollowing: boolean;
}

export interface SavedCollection {
  id: string;
  name: string;
  description: string;
  privacy: 'Public' | 'Private';
  postIds: string[];
  updatedAt: string;
}

export interface TrendingTopic {
  id: string;
  hashtag: string;
  category: string;
  postsCount: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export type AppRoute =
  | 'landing'
  | 'login'
  | 'signup'
  | 'verify-otp'
  | 'forgot-password'
  | 'home'
  | 'feed'
  | 'explore'
  | 'profile'
  | 'friends'
  | 'messages'
  | 'notifications'
  | 'bookmarks'
  | 'groups'
  | 'group-details'
  | 'pages'
  | 'insights'
  | 'search'
  | 'settings'
  | 'help'
  | 'about'
  | 'contact'
  | 'faq'
  | '404';
