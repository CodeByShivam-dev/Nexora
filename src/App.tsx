import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Modals } from './components/Modals';
import { ToastContainer } from './components/ToastContainer';

// Page Imports
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OtpVerifyPage } from './pages/OtpVerifyPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomeDashboard } from './pages/HomeDashboard';
import { NewsFeedPage } from './pages/NewsFeedPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';
import { FriendsPage } from './pages/FriendsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { GroupsPage } from './pages/GroupsPage';
import { PagesPage } from './pages/PagesPage';
import { InsightsPage } from './pages/InsightsPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { route, isLoggedIn } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Determine if current route uses the authenticated three-column shell
  const isAuthShell =
    isLoggedIn &&
    !['landing', 'login', 'signup', 'verify-otp', 'forgot-password'].includes(route);

  const renderActivePage = () => {
    switch (route) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'verify-otp':
        return <OtpVerifyPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'home':
        return <HomeDashboard />;
      case 'feed':
        return <NewsFeedPage />;
      case 'explore':
        return <ExplorePage />;
      case 'profile':
        return <ProfilePage />;
      case 'friends':
        return <FriendsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'groups':
      case 'group-details':
        return <GroupsPage />;
      case 'pages':
        return <PagesPage />;
      case 'insights':
        return <InsightsPage />;
      case 'search':
        return <SearchPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
      case 'faq':
      case 'contact':
        return <HelpCenterPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors flex flex-col">
      {/* Global Top Navbar */}
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Main Content Area */}
      {isAuthShell ? (
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-6 px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-8">
          {/* Left Desktop Sidebar */}
          <Sidebar />

          {/* Center Main Viewport */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={route}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Right Desktop Sidebar (Widgets) - hide on messages to give full width */}
          {route !== 'messages' && <RightSidebar />}
        </div>
      ) : (
        <main className="flex-1 pb-16 lg:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Modals & Dialogs */}
      <Modals
        isCreateModalOpen={isCreateModalOpen}
        onCloseCreateModal={() => setIsCreateModalOpen(false)}
      />

      {/* Floating Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
