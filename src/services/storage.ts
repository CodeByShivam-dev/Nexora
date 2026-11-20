import {
  AppNotification,
  AppSettings,
  Community,
  Conversation,
  Message,
  Post,
  ReportRecord,
  Story,
  StoryHighlight,
  StoryPrivacy,
  User,
} from '../types';
import { isStoryExpired, safeJsonParse } from '../utils/formatters';

const KEYS = {
  USERS: 'nexora_users_v1',
  SESSION_USER_ID: 'nexora_session_user_id_v1',
  POSTS: 'nexora_posts_v1',
  STORIES: 'nexora_stories_v1',
  HIGHLIGHTS: 'nexora_highlights_v1',
  NOTIFICATIONS: 'nexora_notifications_v1',
  CONVERSATIONS: 'nexora_conversations_v1',
  MESSAGES: 'nexora_messages_v1',
  COMMUNITIES: 'nexora_communities_v1',
  BOOKMARKS: 'nexora_bookmarks_v1',
  SETTINGS: 'nexora_settings_v1',
  RECENT_SEARCHES: 'nexora_recent_searches_v1',
  REPORTS: 'nexora_reports_v1',
  SEEDED: 'nexora_seeded_v2',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  defaultStoryPrivacy: StoryPrivacy.PUBLIC,
  privateProfile: false,
  showActivityStatus: true,
  notifications: {
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    storyReplies: true,
  },
};

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return safeJsonParse<T>(raw, fallback);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('LocalStorage write failed (possible quota limit):', err);
    return false;
  }
}

export const storage = {
  isSeeded: (): boolean => {
    try {
      return localStorage.getItem(KEYS.SEEDED) === 'true';
    } catch {
      return false;
    }
  },
  markSeeded: () => writeStorage(KEYS.SEEDED, 'true'),

  getSessionUserId: (): string | null => {
    try {
      return localStorage.getItem(KEYS.SESSION_USER_ID);
    } catch {
      return null;
    }
  },
  setSessionUserId: (id: string | null) => {
    try {
      if (id) {
        localStorage.setItem(KEYS.SESSION_USER_ID, id);
      } else {
        localStorage.removeItem(KEYS.SESSION_USER_ID);
      }
    } catch {
      // ignore
    }
  },

  getUsers: (): User[] => readStorage<User[]>(KEYS.USERS, []),
  saveUsers: (users: User[]) => writeStorage(KEYS.USERS, users),

  getPosts: (): Post[] => readStorage<Post[]>(KEYS.POSTS, []),
  savePosts: (posts: Post[]) => writeStorage(KEYS.POSTS, posts),

  // Keep all stories so Highlights can still reference archived stories, while active stories filter by !isStoryExpired
  getStories: (): Story[] => readStorage<Story[]>(KEYS.STORIES, []),
  getActiveStories: (): Story[] =>
    readStorage<Story[]>(KEYS.STORIES, []).filter((s) => !isStoryExpired(s.expiresAt)),
  saveStories: (stories: Story[]) => writeStorage(KEYS.STORIES, stories),

  getHighlights: (): StoryHighlight[] =>
    readStorage<StoryHighlight[]>(KEYS.HIGHLIGHTS, []),
  saveHighlights: (items: StoryHighlight[]) =>
    writeStorage(KEYS.HIGHLIGHTS, items),

  getNotifications: (): AppNotification[] =>
    readStorage<AppNotification[]>(KEYS.NOTIFICATIONS, []),
  saveNotifications: (items: AppNotification[]) =>
    writeStorage(KEYS.NOTIFICATIONS, items),

  getConversations: (): Conversation[] =>
    readStorage<Conversation[]>(KEYS.CONVERSATIONS, []),
  saveConversations: (items: Conversation[]) =>
    writeStorage(KEYS.CONVERSATIONS, items),

  getMessages: (): Message[] => readStorage<Message[]>(KEYS.MESSAGES, []),
  saveMessages: (items: Message[]) => writeStorage(KEYS.MESSAGES, items),

  getCommunities: (): Community[] => readStorage<Community[]>(KEYS.COMMUNITIES, []),
  saveCommunities: (items: Community[]) => writeStorage(KEYS.COMMUNITIES, items),

  getBookmarksMap: (): Record<string, string[]> =>
    readStorage<Record<string, string[]>>(KEYS.BOOKMARKS, {}),
  saveBookmarksMap: (map: Record<string, string[]>) =>
    writeStorage(KEYS.BOOKMARKS, map),

  getSettings: (): AppSettings => ({
    ...DEFAULT_SETTINGS,
    ...readStorage<Partial<AppSettings>>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  }),
  saveSettings: (settings: AppSettings) => writeStorage(KEYS.SETTINGS, settings),

  getRecentSearches: (): string[] =>
    readStorage<string[]>(KEYS.RECENT_SEARCHES, []),
  saveRecentSearches: (searches: string[]) =>
    writeStorage(KEYS.RECENT_SEARCHES, searches),

  getReports: (): ReportRecord[] => readStorage<ReportRecord[]>(KEYS.REPORTS, []),
  saveReports: (reports: ReportRecord[]) => writeStorage(KEYS.REPORTS, reports),

  clearAllNexoraData: () => {
    try {
      Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};
