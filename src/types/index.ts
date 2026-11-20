export enum StoryPrivacy {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  CLOSE_FRIENDS = 'close_friends',
}

export enum PostCategory {
  TECHNOLOGY = 'Technology',
  PROGRAMMING = 'Programming',
  PHOTOGRAPHY = 'Photography',
  GAMING = 'Gaming',
  LIFESTYLE = 'Lifestyle',
  EDUCATION = 'Education',
  DESIGN = 'Design',
}

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MENTION = 'mention',
  STORY_REPLY = 'story_reply',
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  passwordHash: string; // Frontend demo-only credential check
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  website: string;
  joinedAt: string;
  verified: boolean;
  followers: string[];
  following: string[];
  closeFriends: string[];
  isPrivate: boolean;
  roleTitle?: string;
}

export interface CommentReply {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  replies: CommentReply[];
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  images: string[];
  videoUrl?: string;
  hashtags: string[];
  category: PostCategory;
  communityId?: string;
  likes: string[];
  comments: PostComment[];
  sharesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface StoryReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface StoryReply {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  mediaType: 'image' | 'video' | 'text';
  mediaUrl?: string;
  imageFit?: 'cover' | 'contain';
  textOverlay?: string;
  textAlign?: 'left' | 'center' | 'right';
  textSize?: 'sm' | 'md' | 'lg';
  caption?: string;
  backgroundStyle?: string;
  privacy: StoryPrivacy;
  createdAt: string;
  expiresAt: string;
  viewedBy: string[];
  reactions: StoryReaction[];
  replies: StoryReply[];
}

export interface StoryHighlight {
  id: string;
  userId: string;
  title: string;
  coverUrl: string;
  storyIds: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  storyId?: string;
  previewText?: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: PostCategory;
  bannerImage: string;
  memberIds: string[];
  accentColor: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'en' | 'es' | 'de' | 'jp';
  defaultStoryPrivacy: StoryPrivacy;
  privateProfile: boolean;
  showActivityStatus: boolean;
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    storyReplies: boolean;
  };
}

export interface ReportRecord {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  details: string;
  createdAt: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
