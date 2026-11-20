import { useEffect, useState } from 'react';
import { useNexora } from '../context/NexoraContext';
import { safeJsonParse } from '../utils/formatters';

export function useAuth() {
  const { currentUser, login, loginDemo, register, logout, isUsernameAvailable } = useNexora();
  return { currentUser, login, loginDemo, register, logout, isUsernameAvailable };
}

export function usePosts() {
  const {
    posts,
    createPost,
    editPost,
    deletePost,
    toggleLikePost,
    incrementShareCount,
    addComment,
    deleteComment,
    addReplyToComment,
    reportPost,
  } = useNexora();
  return {
    posts,
    createPost,
    editPost,
    deletePost,
    toggleLikePost,
    incrementShareCount,
    addComment,
    deleteComment,
    addReplyToComment,
    reportPost,
  };
}

export function useStories() {
  const {
    visibleStories,
    activeStoryUserId,
    setActiveStoryUserId,
    isCreateStoryOpen,
    setCreateStoryOpen,
    createStory,
    deleteStory,
    markStoryViewed,
    reactToStory,
    replyToStory,
  } = useNexora();
  return {
    visibleStories,
    activeStoryUserId,
    setActiveStoryUserId,
    isCreateStoryOpen,
    setCreateStoryOpen,
    createStory,
    deleteStory,
    markStoryViewed,
    reactToStory,
    replyToStory,
  };
}

export function useNotifications() {
  const {
    userNotifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useNexora();
  return {
    notifications: userNotifications,
    unreadCount: unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  };
}

export function useMessages() {
  const {
    conversations,
    messages,
    startOrGetConversation,
    sendMessage,
    deleteMessage,
  } = useNexora();
  return {
    conversations,
    messages,
    startOrGetConversation,
    sendMessage,
    deleteMessage,
  };
}

export function useBookmarks() {
  const { bookmarkedPostIds, toggleBookmark, isBookmarked } = useNexora();
  return { bookmarkedPostIds, toggleBookmark, isBookmarked };
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? safeJsonParse<T>(item, initialValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore quota error
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
