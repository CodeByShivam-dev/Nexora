import { MotionConfig } from 'motion/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from './components/common/ToastContainer';
import { CreatePostModal } from './components/posts/CreatePostModal';
import { CreateStoryModal } from './components/stories/CreateStoryModal';
import { StoryViewerModal } from './components/stories/StoryViewerModal';
import { NexoraProvider, useNexora } from './context/NexoraContext';
import { BookmarksPage } from './pages/Bookmarks/BookmarksPage';
import { CommunitiesPage } from './pages/Communities/CommunitiesPage';
import { CreatePostPage } from './pages/CreatePost/CreatePostPage';
import { CreatorDashboardPage } from './pages/Dashboard/CreatorDashboardPage';
import { ExplorePage } from './pages/Explore/ExplorePage';
import { HomePage } from './pages/Home/HomePage';
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Login/LoginPage';
import { MessagesPage } from './pages/Messages/MessagesPage';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';
import { EditProfilePage } from './pages/Profile/EditProfilePage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { SearchPage } from './pages/Search/SearchPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useNexora();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function StoriesRouteFallback() {
  const { currentUser, visibleStories, setActiveStoryUserId } = useNexora();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (visibleStories.length > 0) {
    setActiveStoryUserId(visibleStories[0].authorId);
  }
  return <Navigate to="/home" replace />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:conversationId"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route path="/stories" element={<StoriesRouteFallback />} />
        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <CommunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/communities/:communityId"
          element={
            <ProtectedRoute>
              <CommunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CreatorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CreatePostModal />
      <CreateStoryModal />
      <StoryViewerModal />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <NexoraProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NexoraProvider>
    </MotionConfig>
  );
}
