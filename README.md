
# NEXORA — Next-Generation Social Networking Platform

**Connect. Create. Discover.**

NEXORA is a modern, full-stack social networking platform designed to connect people, creators, and communities through a seamless digital experience.

Built using modern frontend and backend technologies, NEXORA brings together social networking, content discovery, media sharing, real-time messaging, and personalized user experiences in one unified platform.

---

## ✨ Core Features

### 🔐 Authentication & Account Management
- Secure user registration and login.
- JWT-based authentication and session management.
- Password hashing and validation.
- OTP-based verification workflows.
- Protected routes and role-based access control.
- User account and profile management.

### 📰 Interactive Social Feed
- Personalized content feed.
- Feed filters: For You, Following, Latest, and Media.
- Create, edit, and delete posts.
- Like, comment, and nested reply functionality.
- Bookmark and share posts.
- Trending content and hashtag discovery.
- Pagination and optimized content retrieval.

### 📸 Stories & Media Sharing
- Interactive 24-hour stories experience.
- Image and video story support.
- Customizable text-based stories.
- Story captions, reactions, and replies.
- Audience privacy controls.
- Full-screen story viewer with interactive navigation.
- Media upload and storage management.

### 👤 User Profiles & Social Connections
- Customizable user profiles.
- Profile pictures and cover images.
- Bio, location, and website information.
- Follow and unfollow functionality.
- Followers and following management.
- Profile-specific content feeds.
- Posts, Replies, Media, and Liked sections.
- Close Friends functionality.

### 💬 Real-Time Messaging
- Dedicated messaging interface.
- One-to-one conversations.
- Real-time communication using WebSockets.
- Message delivery and read status.
- Conversation management.
- Message deletion.
- Responsive chat experience across devices.

### 🔎 Explore & Content Discovery
- Global user and content search.
- Trending hashtags and topics.
- Popular creator discovery.
- Category-based content exploration.
- Recent search history.
- Community discovery.

### 🌐 Communities
- Topic-based communities.
- Join and leave communities.
- Community-specific content feeds.
- Publish and interact with community posts.
- Discover people with shared interests.

### 📊 Creator Dashboard & Analytics
- Centralized creator dashboard.
- Engagement and activity metrics.
- Content performance insights.
- Interactive charts and visualizations.
- Data-driven creator insights.

### ⚙️ Notifications & Settings
- Centralized notification experience.
- Social interaction notifications.
- Notification preferences.
- Dark and light theme support.
- Account and privacy settings.
- Configurable application preferences.

---

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- Framer Motion / Motion
- Lucide React
- Recharts
- React Hook Form
- Zod

### Backend & API
- Node.js
- Express.js
- TypeScript
- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- RESTful APIs
- WebSocket Communication
- JWT Authentication
- BCrypt Password Hashing

### Database & Storage
- PostgreSQL
- Neon Serverless PostgreSQL
- Redis
- IndexedDB
- LocalStorage

### Development & Deployment
- Git & GitHub
- Maven
- npm
- Docker
- Vercel
- Render
- Environment-based Configuration

---

## 🏗️ Application Architecture

NEXORA follows a modular application architecture designed to separate presentation, business logic, API communication, and data persistence.

**Frontend Layer**
- Responsive React-based user interface.
- Reusable components and modular page structure.
- Centralized application state management.
- Client-side routing and protected navigation.

**Backend Layer**
- REST API endpoints for application operations.
- Authentication and authorization middleware.
- Structured request validation and error handling.
- Modular services and database interaction.
- WebSocket-based real-time communication.

**Data Layer**
- PostgreSQL relational data management.
- Persistent storage for user accounts, posts, interactions, and conversations.
- Database-backed social relationships.
- Structured media and profile data management.

---

## 🎨 User Experience & Interface

- Premium dark-first visual identity.
- Dark and light theme support.
- Responsive three-column desktop layout.
- Mobile-friendly navigation.
- Smooth animations and micro-interactions.
- Consistent typography and design system.
- Reusable UI components.
- Optimized layouts for different screen sizes.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Java 17+
- Maven
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/CodeByShivam-dev/Nexora.git
```

### 2. Navigate to the Project

```bash
cd Nexora
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create your environment configuration using the provided `.env.example` file.

Add the required database credentials, authentication secrets, and application configuration.

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Start the Spring Boot Backend

```bash
mvn spring-boot:run
```

### 7. Production Build

```bash
npm run build
```

### 8. Type Checking

```bash
npm run lint
```

---

## 🔐 Security & Reliability

Security and reliability are important considerations in NEXORA's architecture.

- JWT-based authentication.
- BCrypt password hashing.
- Protected API endpoints.
- Input validation and structured error handling.
- Parameterized database queries.
- Role-based access control.
- Environment-based secret management.
- Database-backed application persistence.

---

## 🎯 Project Vision

NEXORA aims to create more than a conventional social networking interface.

Its vision is to establish a connected digital ecosystem where users can express themselves, share experiences, discover creators, participate in communities, and communicate seamlessly.

The project brings together modern frontend engineering, backend development, database management, authentication, and real-time communication to demonstrate the architecture and engineering considerations behind a modern social networking application.

---

## 👨‍💻 Developer

**Shivam Kumar**

Full-Stack Developer | Java | Spring Boot | React | TypeScript

- GitHub: [CodeByShivam-dev](https://github.com/CodeByShivam-dev)

---

<p align="center">
  <strong>NEXORA — Connect. Create. Discover.</strong>
  <br/>
  Bringing people, ideas, and communities closer through technology.
</p>
