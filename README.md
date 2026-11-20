
# ✨ NEXORA — Next-Generation Social Networking Platform

<p align="center">
  <strong>🌐 Live Demo:</strong>
  <a href="https://nexorasocialmedi.netlify.app/" target="_blank">
    Explore NEXORA →
  </a>
</p>

<p align="center">
  <strong>Connect. Create. Discover.</strong>
</p>

---

## 🌟 About NEXORA

NEXORA is a modern, interactive, and visually immersive social networking web application designed to bring people, creators, and communities together.

Inspired by the interaction patterns of leading social platforms, NEXORA combines content sharing, personalized feeds, immersive Stories, creator profiles, messaging interfaces, and community engagement into one unified experience.

Built with React 19 and TypeScript, the platform focuses on delivering a premium user experience through responsive layouts, smooth animations, reusable components, and interactive social features.

From discovering trending content to managing personal profiles, NEXORA demonstrates how a comprehensive social networking experience can be developed using modern frontend engineering.

**Project Highlights:**
- 15+ interactive application routes.
- 10 major social networking modules.
- Interactive feed and content management.
- Instagram-inspired 24-hour Stories experience.
- Dynamic user profiles and social connections.
- Messaging and notification interfaces.
- Browser-based data persistence.
- Responsive desktop, tablet, and mobile experience.

---



## 🚀 Core Features

### 🏠 1. Advanced Social Feed

A dynamic content-sharing experience designed around personalized discovery and social interaction.

- Personalized For You feed.
- Following-based content filtering.
- Latest posts and media-only views.
- Interactive post composer.
- Text and image-based posts.
- Like and unlike functionality.
- Comments and nested replies.
- Edit and delete post functionality.
- Bookmark and saved posts.
- Post sharing and copy-link functionality.
- Report post interaction.
- Pagination and content loading.

### 📸 2. Immersive 24-Hour Stories

An Instagram-inspired Stories experience that allows users to share moments through images, videos, and creative text cards.

**Story Creation**
- Upload images from device storage.
- Upload short videos.
- Create customized text stories.
- Add captions and emojis.
- Customize story backgrounds.
- Preview stories before publishing.
- Choose audience privacy.
- Public, Followers, and Close Friends options.
- Support multiple stories per user.
- Automatic 24-hour expiration.

**Full-Screen Story Viewer**
- Immersive full-screen viewing experience.
- Animated story progress indicators.
- Automatic story progression.
- Previous and next story navigation.
- Pause and resume controls.
- Video mute and unmute.
- Keyboard navigation.
- Mobile touch gestures.
- Story reactions and replies.
- Viewed status indicators.
- Story viewer counts.

### 👤 3. Dynamic User Profiles

Personalized profile experiences with editable information and social statistics.

- Profile picture uploads.
- Custom cover image uploads.
- Display name and username.
- Editable bio and personal information.
- Location and website details.
- Followers and following lists.
- Follow and unfollow interactions.
- Close Friends management.
- Profile editing interface.
- Posts, Replies, Media, and Liked tabs.
- Story Highlights.

### 🔍 4. Explore & Content Discovery

A dedicated discovery experience for exploring creators, content, and trending topics.

- Trending posts.
- Popular creators.
- Trending hashtags.
- Category-based discovery.
- Technology and programming.
- Photography and gaming.
- Lifestyle and education.
- Design and creative content.
- Interactive category filtering.
- Dynamic content exploration.

### 🔎 5. Smart Search Experience

A unified search interface for discovering different types of content within the application.

- Search users and creators.
- Search posts.
- Search hashtags.
- Search communities.
- Live search filtering.
- Recent search history.
- Search history management.

### 💬 6. Interactive Messaging Interface

A modern messaging experience with responsive layouts and locally persisted conversations.

- Conversation list management.
- Conversation search.
- Start new conversations.
- Text message composition.
- Emoji insertion.
- Message timestamps.
- Message deletion.
- Persistent local chat history.
- Desktop split-view messaging.
- Dedicated mobile chat interface.

### 🔔 7. Notifications Center

A centralized notification interface for tracking social interactions.

- Like notifications.
- Comment notifications.
- New follower notifications.
- Story reply notifications.
- Read and unread indicators.
- Mark all notifications as read.
- Clear notification history.
- Notification timestamps.

### 👥 8. Interest-Based Communities

A dedicated community experience built around shared interests and content discovery.

- Browse available communities.
- Search communities.
- Join and leave communities.
- Community member statistics.
- Community-specific posts.
- Interest-based categories.
- Publish posts within communities.

### 📊 9. Creator Dashboard & Analytics

A dedicated dashboard providing an overview of creator activity through interactive visualizations.

- Total posts.
- Total followers.
- Total likes.
- Total comments.
- Engagement overview.
- Activity visualizations.
- Recharts-powered charts.
- Locally calculated statistics.

### ⚙️ 10. Personalization & Settings

A customizable application environment with user-controlled preferences.

- Dark and light themes.
- Story privacy preferences.
- Notification preferences.
- Account preferences.
- Local demo password update.
- Reset demo data functionality.

---

## 🎨 UI/UX & Design Philosophy

NEXORA follows a premium dark-first design philosophy with a distinctive purple and cyan visual identity.

**Visual Design**
- Modern dark interface.
- Purple and cyan accent gradients.
- Space Grotesk typography for headings.
- Inter typography for body content.
- JetBrains Mono for tabular numerals.
- Clean layouts and visual hierarchy.
- Interactive cards and modal interfaces.
- Subtle hover effects and transitions.

**Interaction Design**
- Smooth page transitions.
- Framer Motion-powered animations.
- Interactive navigation elements.
- Responsive menus and modals.
- Story progress animations.
- Consistent component behavior.
- Support for reduced-motion preferences.

**Responsive Architecture**

Designed to provide a consistent experience across:
- Mobile phones.
- Tablets.
- Laptops.
- Desktop monitors.

The desktop experience features a three-column social networking layout, while mobile devices use dedicated compact navigation and touch-friendly interactions.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend application architecture |
| TypeScript | Type safety and maintainable development |
| Vite | Development server and build tooling |
| Tailwind CSS v4 | Modern responsive styling |
| React Router DOM | Client-side navigation |
| Framer Motion / Motion | Animations and transitions |
| Lucide React | Icon system |
| Recharts | Data visualization |
| React Hook Form | Form management |
| Zod | Schema-based validation |
| LocalStorage | Browser-based application data persistence |
| IndexedDB | Image and video blob storage |

---

## 🏗️ Frontend Architecture

NEXORA follows a modular, component-based frontend architecture designed to improve maintainability, scalability, and code reusability.

**Application Structure**

- Reusable UI components.
- Modular page-level architecture.
- Client-side routing.
- Centralized application state.
- Form validation and handling.
- Browser storage management.
- Media upload and retrieval.
- Responsive design components.
- Interactive modal and overlay systems.

**Core Application Modules**

1. Authentication & Registration
2. Social Feed
3. Posts & Comments
4. Stories & Media
5. User Profiles
6. Follow Management
7. Explore & Search
8. Messaging
9. Notifications
10. Communities
11. Creator Dashboard
12. Application Settings

---

## 💾 Client-Side Data Persistence

NEXORA uses browser-native storage technologies to maintain application data across page refreshes.

### LocalStorage

Used for storing structured application information, including:

- Demo authentication state.
- User information.
- Posts and comments.
- Likes and bookmarks.
- Follow relationships.
- Notifications.
- Application preferences.
- Locally persisted conversations.

### IndexedDB

Used for browser-side media persistence:

- Profile pictures.
- Cover images.
- Post media.
- Story images.
- Story videos.

This architecture enables a persistent browser-local experience without requiring an external database.

---

## 📱 Application Routes

| Route | Description |
|---|---|
| `/` | Landing Page |
| `/login` | Login |
| `/register` | Registration |
| `/home` | Social Feed |
| `/explore` | Content Discovery |
| `/search` | Search |
| `/notifications` | Notifications |
| `/messages` | Messaging |
| `/bookmarks` | Saved Posts |
| `/profile` | Current User Profile |
| `/profile/edit` | Edit Profile |
| `/profile/:username` | Public User Profile |
| `/communities` | Communities |
| `/dashboard` | Creator Dashboard |
| `/settings` | Application Settings |

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js
- npm
- Git
- Modern web browser

### 1. Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to Project Directory

```bash
cd nexora
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Production Build

```bash
npm run build
```

### 6. Type Checking / Linting

```bash
npm run lint
```

---

## 🌐 Deployment

NEXORA can be deployed as a frontend application using Vercel.

**Recommended Vercel Configuration**

| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

The project includes a `vercel.json` configuration for handling client-side routing in the single-page application.

---

## 🔐 Application Scope & Technical Limitations

NEXORA is a frontend-only demonstration application.

All application functionality is implemented within the browser using React, browser storage APIs, and client-side application logic.

**Current Architecture**
- No external backend server.
- No remote database.
- No server-side authentication.
- No cross-device data synchronization.
- Messaging is locally simulated and does not provide real-time communication between independent users.
- Notifications are generated from local interactions.
- Creator analytics are calculated from browser-local data.
- Uploaded media is stored in browser storage.

The authentication experience is intended for demonstration purposes and is not a production-grade security implementation.

---

## 🔮 Future Development Possibilities

Potential future enhancements include:

- Backend integration.
- Cloud-based database management.
- Secure server-side authentication.
- Real-time messaging infrastructure.
- Cloud media storage.
- Cross-device synchronization.
- Push notifications.
- Advanced content recommendation systems.
- Production-grade privacy and moderation.
- Advanced creator analytics.

---

## 🎯 Project Objective

The primary objective of NEXORA is to demonstrate the development of a feature-rich social networking experience using modern frontend technologies.

The project explores practical frontend engineering concepts, including:

- Advanced React component architecture.
- TypeScript-based development.
- Responsive UI/UX engineering.
- Complex application state management.
- Client-side routing.
- Browser-based persistence.
- Media handling with IndexedDB.
- Interactive form validation.
- Data visualization.
- Animation and micro-interaction design.
- Modular and reusable frontend development.

---

## 👨‍💻 Developer

**Shivam Kumar**

Frontend Developer | React | TypeScript | JavaScript

- GitHub: [CodeByShivam-dev](https://github.com/CodeByShivam-dev)

---

<p align="center">
  <strong>NEXORA</strong>
  <br/>
  Connect. Create. Discover.
  <br/><br/>
  Built with passion using modern frontend technologies.
</p>
