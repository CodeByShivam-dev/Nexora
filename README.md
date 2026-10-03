# NEXORA

NEXORA is a full-stack social networking and real-time communication platform engineered with a decoupled architecture, relational persistence, and bidirectional WebSocket communication. It provides secure JWT authentication, multi-criteria user discovery, chronological social feeds, interactive media publishing, and persistent 1-to-1 direct messaging with delivery status tracking.

## Overview

Modern social platforms require high responsiveness for interactions, persistent relational integrity for user relationships, and low-latency bidirectional channels for direct messaging. NEXORA was architected to address these engineering requirements without reliance on synthetic polling or unauthenticated mock state.

## Key Capabilities

- **Identity & Account Lifecycle**: Multi-stage account creation with bcrypt password hashing, 6-digit OTP verification, and JWT session authorization.
- **Social Graph & Discovery**: Follow/unfollow mechanics, real-time prefix search across usernames and display names, bookmarking, and soft-delete content moderation.
- **Publishing & Media Feed**: Chronological activity streams supporting multiline text, hashtag tokenization, and photo attachments with client-side preview and server-side disk storage.
- **Real-Time Direct Messaging**: Persistent 1-to-1 messaging built over WebSockets with ping/pong keepalive heartbeats, optimistic client-side dispatch, and delivery state tracking.
- **Universal Multi-Device Layout**: Three-column desktop interface, collapsible tablet navigation, and mobile bottom navigation with safe-area spacing.

## Screenshots / Demo

<p align="center">
  <img src="src/assets/images/hero_social_preview_1790446483047.jpg" alt="NEXORA Platform Overview" width="800" />
</p>

### Interface Previews

| Feed & Post Creation | Interactive Workspace |
|---------------------|----------------------|
| <img src="src/assets/images/post_photo_tech_1790446531677.jpg" alt="Feed & Media Publishing" width="400" /> | <img src="src/assets/images/group_banner_dev_1790446548511.jpg" alt="Community & Engineering Hubs" width="400" /> |

## Core Features

### Authentication & Access Control

- **User Registration**: Input validation, duplicate username/email checks, and salted bcrypt password hashing (10 salt rounds).
- **Two-Factor OTP Verification**: 6-digit cryptographic verification codes with 10-minute expiry and attempt limiting.
- **JWT Session Tokens**: Cryptographically signed access tokens transmitting user identities over standard HTTP Authorization: Bearer headers.
- **Session Auto-Provisioning**: Automated bootstrap session negotiation for instant platform exploration.

### Social Interaction & Graph

- **User Profiles**: Custom avatars, banners, bios, technical interests, work experience, and location metadata.
- **Relationship Mechanics**: Asymmetric follow/unfollow operations with mutual relationship tracking and self-follow guards.
- **Chronological News Feed**: Multi-criteria feed filtering (All Activity, Following Only, Media Only) with soft-deleted record exclusion.
- **Post Interactions**: Real-time post creation, inline content editing, author-only deletion, hashtag extraction, and atomic like/bookmark toggles.
- **Comment Threads**: Nested comment structures linked directly to root posts with cascading deletions.
- **User Search**: Server-side SQL pattern-matching (ILIKE) searching across usernames and display names with debounce controls.

### Real-Time Direct Messaging

- **Dedicated WebSocket Channel**: Bidirectional socket server mounted on `/ws` using native frames.
- **Connection Heartbeats**: 20-second client-side ping intervals paired with 25-second server watchdog sweeps to prevent reverse-proxy timeout drops.
- **Auto-Reconnection**: Exponential backoff reconnect algorithm with random jitter, re-establishing connections on network reconnection and tab visibility events.
- **Optimistic UI Dispatch**: Immediate local message rendering with temporary client IDs, reconciling with server database IDs upon acknowledgment.
- **Delivery & Read States**: Live message status tracking transitions (sent → delivered → read).
- **Typing Indicators**: Ephemeral typing events broadcast to conversation participants without database disk writes.

### Media & File Management

- **Multipart File Uploads**: Multer disk storage handling profile avatars, cover images, and post attachments under `/uploads`.
- **MIME & Extension Guards**: Whitelist validation for `.jpg`, `.jpeg`, `.png`, `.webp`, and `.gif` formats with 10MB payload thresholds.
- **Resilient Fallback**: Client-side FileReader base64 fallback pipeline ensuring media availability across ephemeral execution environments.

## Architecture

NEXORA follows a decoupled layered architecture separating the client,
API gateway, real-time communication layer, and PostgreSQL persistence.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                                │
│                                                                     │
│  React 19 + TypeScript + Vite                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Web Browser / Mobile Client                                  │  │
│  │                                                               │  │
│  │  • React Components                                           │  │
│  │  • Local State / Optimistic UI                                │  │
│  │  • REST API Client                                            │  │
│  │  • WebSocket Client                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
             HTTP/REST                  WebSocket
                 │                           │
                 ▼                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       APPLICATION TIER                              │
│                                                                     │
│  Node.js + Express + TypeScript                                    │
│  ┌──────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ REST API Gateway             │  │ WebSocket Server            │  │
│  │                              │  │                             │  │
│  │ • JWT Authentication         │  │ • Connection Registry       │  │
│  │ • Request Validation         │  │ • Authentication             │  │
│  │ • Rate Limiting              │  │ • Heartbeat / Ping-Pong     │  │
│  │ • File Uploads (Multer)      │  │ • Message Routing           │  │
│  │ • API Controllers            │  │ • Typing Events             │  │
│  └──────────────┬───────────────┘  └──────────────┬──────────────┘  │
│                 │                                 │                 │
│                 └────────────────┬────────────────┘                 │
│                                  │                                  │
│                         Parameterized SQL                            │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PERSISTENCE TIER                            │
│                                                                     │
│                     PostgreSQL / Neon                               │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  users   │  │  posts   │  │ conversations│  │   messages   │   │
│  └──────────┘  └──────────┘  └──────────────┘  └──────────────┘   │
│                                                                     │
│  • Foreign Keys                                                     │
│  • Constraints                                                      │
│  • Indexes                                                          │
│  • Transactions                                                      │
│  • Connection Pooling                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### System Component Responsibilities

#### Client Tier (Frontend SPA)
- Built with React 19, TypeScript, Tailwind CSS, and Framer Motion.
- Manages local client state, optimistic UI mutations, and persistent offline mirrors in localStorage.
- Maintains a single WebSocket connection singleton with automatic lifecycle management and queue buffering.

#### Gateway Tier (Express & Vite Middleware)
- Serves static assets, compiled bundles, and uploaded media files.
- Enforces security boundaries: token verification, route rate limiting, and request sanitization.
- Exposes RESTful endpoints conforming to standard HTTP status codes.

#### Real-Time Tier (WebSocket Server)
- Manages active socket instances via a synchronized multi-socket map (`userSockets: Map<string, WebSocket[]>`).
- Authenticates socket sessions via query parameters or explicit `{ type: 'auth', token }` handshake payloads.
- Forwards delivery acknowledgments and broadcasts events to targeted client sessions.

#### Persistence Tier (PostgreSQL)
- Relational database schema with primary foreign key constraints and cascade rules.
- Connection pooling managed through `pg.Pool` utilizing parameterized queries to eliminate SQL injection vulnerabilities.

> **Note**: The repository also includes a complete enterprise Java 17 / Spring Boot 3.3.4 microservice architecture located under `src/main/java/com/nexora` with Spring Security, Spring Data JPA, and Flyway migrations (`pom.xml`).


Then replace your **Real-Time Messaging Architecture** section with:

```text
## Real-Time Messaging Architecture

The direct messaging subsystem separates WebSocket transport from
persistent PostgreSQL storage.

```text
┌───────────────┐
│   CLIENT A    │
│               │
│  React UI     │
│  WebSocket    │
└───────┬───────┘
        │
        │ 1. send_message
        │
        ▼
┌───────────────────────────────────────┐
│           NEXORA GATEWAY              │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ WebSocket Handler               │  │
│  │                                 │  │
│  │ • Authenticate JWT              │  │
│  │ • Validate conversation         │  │
│  │ • Validate message payload      │  │
│  │ • Apply rate limits             │  │
│  └───────────────┬─────────────────┘  │
│                  │                    │
│                  │ 2. Persist         │
│                  ▼                    │
│  ┌─────────────────────────────────┐  │
│  │ PostgreSQL                      │  │
│  │                                 │  │
│  │ messages                        │  │
│  │ conversations                   │  │
│  │ conversation_members            │  │
│  └───────────────┬─────────────────┘  │
│                  │                    │
│                  │ 3. Database ACK    │
│                  ▼                    │
│  ┌─────────────────────────────────┐  │
│  │ Message Dispatcher              │  │
│  │                                 │  │
│  │ userSockets                     │  │
│  │ Map<UserId, WebSocket[]>        │  │
│  └───────────────┬─────────────────┘  │
└──────────────────┼────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          │ 4. message_ack  │ 5. new_message
          │                 │
          ▼                 ▼
┌───────────────┐   ┌───────────────┐
│   CLIENT A    │   │   CLIENT B    │
│               │   │               │
│ Reconcile    │   │ Render message│
│ temp message │   │               │
└───────────────┘   └───────┬───────┘
                            │
                            │ 6. message_delivered
                            ▼
                    ┌──────────────────┐
                    │ NEXORA GATEWAY   │
                    └────────┬─────────┘
                             │
                             │ 7. delivered
                             ▼
                       ┌─────────────┐
                       │  CLIENT A   │
                       │             │
                       │ sent →      │
                       │ delivered   │
                       └─────────────┘
```

### Protocol & Flow Specifications

#### Authentication Handshake
1. The client opens a connection to `/ws?token=<JWT>`.
2. The server decodes the token claims and binds the active socket to the internal user registry:

```json
{ "type": "authenticated", "userId": "1" }
```

#### Heartbeat & Keepalive Protocol
- Every 20 seconds, the client transmits `{ "type": "ping" }`.
- The server resets its socket watchdog and returns `{ "type": "pong" }`.
- If a connection drops, buffered outbound messages remain in memory until the handshake completes.

#### Message Lifecycle

```text 
Client A
   │
   │ send_message
   ▼
WebSocket Gateway
   │
   ├── Authenticate JWT
   │
   ├── Validate conversation membership
   │
   ├── Persist message
   │
   ├── Generate database message ID
   │
   ├───────────────► message_ack ─────────────► Client A
   │
   └───────────────► new_message ─────────────► Client B
                                                   │
                                                   │
                                                   ▼
                                          message_delivered
                                                   │
                                                   ▼
                                          WebSocket Gateway
                                                   │
                                                   ▼
                                          message_delivered
                                                   │
                                                   ▼
                                               Client

```

#### Message Persistence & Broadcast
Outbound payloads transmit conversation IDs, content, optional media URLs, and client-generated UUIDs:

```json
{
  "type": "send_message",
  "conversationId": "14",
  "content": "Reviewing system architecture.",
  "clientMessageId": "cmsg_1790753085"
}
```

1. The gateway writes the record into the `messages` table via a database transaction.
2. The gateway emits a `message_ack` frame back to Client A.
3. If Client B is registered in `userSockets`, the gateway pushes `new_message` directly to Client B's active sockets.
4. When Client B renders the frame, it acknowledges delivery, triggering a status update to Client A.

#### Dual Transport Redundancy
- If the WebSocket channel drops unexpectedly, `ApiService` routes outbound messages via HTTP POST `/api/v1/conversations/:id/messages` without interrupting user composition.

## Security

- **Password Hashing**: Passwords stored as salted hashes using `bcryptjs` with 10 salt rounds. Plaintext credentials are never persisted.
- **Stateless Authorization**: Protected endpoints require a valid JSON Web Token passed via `Authorization: Bearer <token>`.
- **Parameterized SQL Execution**: All database queries executed through parameterized placeholders (`$1`, `$2`, ...) via `pg.Pool`, mitigating SQL injection risks.
- **Resource Ownership Validation**: Mutation requests (deleting posts, updating profiles) strictly verify that `author_id === req.user.userId`.
- **Conversation Access Control**: Membership validation checks verify that users belong to a conversation prior to reading or transmitting messages.
- **Input Sanitization**: User-submitted strings pass through script-tag sanitizers and length-capping routines.

### Granular Rate Limiting

In-memory rate limiting applied per route category:

| Endpoint Category | Rate Limit |
|------------------|------------|
| Authentication / Login | 5 requests / min |
| OTP Verification | 5 requests / 10 min |
| Post Creation | 20 requests / min |
| Direct Messaging | 30 requests / min |
| Search | 60 requests / min |


## Database Design

NEXORA uses PostgreSQL with foreign keys, composite constraints,
indexes, and cascade rules to maintain relational integrity.

```text
                         ┌─────────────────┐
                         │      users      │
                         │─────────────────│
                         │ PK id           │
                         │ username        │
                         │ email           │
                         │ password_hash   │
                         │ role            │
                         └────────┬────────┘
                                  │
                         1        │        1
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌─────────────────┐         ┌─────────────────┐
          │    profiles     │         │      posts      │
          │─────────────────│         │─────────────────│
          │ PK user_id      │         │ PK id           │
          │ display_name    │         │ FK author_id    │
          │ bio             │         │ content         │
          │ avatar_url      │         │ media_url       │
          │ cover_image_url │         │ deleted         │
          └─────────────────┘         └────────┬────────┘
                                                │
                                      1         │        *
                                                │
                              ┌─────────────────┴──────────────┐
                              │                                │
                              ▼                                ▼
                    ┌─────────────────┐              ┌─────────────────┐
                    │    comments     │              │      likes      │
                    │─────────────────│              │─────────────────│
                    │ PK id           │              │ PK/FK post_id  │
                    │ FK post_id      │              │ PK/FK user_id  │
                    │ FK author_id    │              └─────────────────┘
                    │ parent_comment_id│
                    │ content         │
                    └─────────────────┘

                         users
                           │
                           │
                           │ follower / following
                           ▼
                    ┌─────────────────┐
                    │     follows     │
                    │─────────────────│
                    │ follower_id     │
                    │ following_id    │
                    │ UNIQUE pair     │
                    │ No self-follow  │
                    └─────────────────┘


                    ┌──────────────────────┐
                    │    conversations     │
                    │──────────────────────│
                    │ PK id                │
                    │ created_at           │
                    │ updated_at           │
                    └──────────┬───────────┘
                               │
                         1     │     *
                               │
                               ▼
                    ┌──────────────────────┐
                    │ conversation_members │
                    │──────────────────────│
                    │ FK conversation_id   │
                    │ FK user_id           │
                    │ joined_at            │
                    │ read_at              │
                    │ Composite PK         │
                    └──────────┬───────────┘
                               │
                               │
                               ▼
                    ┌──────────────────────┐
                    │       messages       │
                    │──────────────────────│
                    │ PK id                │
                    │ FK conversation_id   │
                    │ FK sender_id         │
                    │ content              │
                    │ media_url            │
                    │ client_message_id    │
                    │ delivered_at         │
                    │ read_at              │
                    └──────────────────────┘
```

### Entity Specifications

| Table | Description |
|-------|-------------|
| `users` | Base identity storing `id` (BIGSERIAL), unique `username`, unique `email`, `password_hash`, verification status, and `role`. |
| `profiles` | User metadata containing `display_name`, `bio`, `location`, `website`, `avatar_url`, and `cover_image_url`. |
| `posts` | Published content records containing `author_id`, `content`, `media_url` (TEXT), `visibility`, `likes_count`, and `deleted` soft-delete flags. |
| `comments` | Comment items containing `post_id`, `author_id`, `parent_comment_id`, and `content`. |
| `likes` | Post like records with a unique composite constraint (`post_id`, `user_id`). |
| `bookmarks` | Saved post references with a unique composite constraint (`post_id`, `user_id`). |
| `follows` | Social graph relations with composite uniqueness (`follower_id`, `following_id`) and check constraints prohibiting self-following. |
| `conversations` | Chat thread roots tracking creation and update timestamps. |
| `conversation_members` | Join table binding `user_id` to `conversation_id` with composite primary constraints and read receipt timestamps. |
| `messages` | Chat messages storing `conversation_id`, `sender_id`, `content`, `media_url`, `client_message_id`, and delivery timestamps. |

## API Overview

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new account and generate verification OTP | No |
| POST | `/api/v1/auth/verify-otp` | Validate 6-digit OTP and issue JWT access token | No |
| POST | `/api/v1/auth/login` | Authenticate credentials and issue JWT access token | No |
| GET | `/api/v1/auth/default-session` | Provision default guest session credentials | No |
| POST | `/api/v1/auth/change-password` | Update account password | Yes |
| GET | `/api/v1/auth/me` | Fetch active authenticated identity payload | Yes |

### User Profiles & Social Graph

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users/:username` | Retrieve full public profile by username | Optional |
| PUT | `/api/v1/users/me` | Update authenticated profile metadata | Yes |
| POST | `/api/v1/users/:userId/follow` | Follow target user | Yes |
| DELETE | `/api/v1/users/:userId/follow` | Unfollow target user | Yes |
| GET | `/api/v1/search/users` | Prefix search across usernames and display names | Optional |
| POST | `/api/v1/users/:userId/block` | Block target user | Yes |

### Posts, Feed & Interactions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/feed` | Paginated chronological feed retrieval | Optional |
| POST | `/api/v1/posts` | Publish a new post with optional media attachment | Yes |
| DELETE | `/api/v1/posts/:id` | Soft-delete owned post | Yes |
| POST | `/api/v1/posts/:postId/like` | Toggle post like | Yes |
| DELETE | `/api/v1/posts/:postId/like` | Remove post like | Yes |
| POST | `/api/v1/posts/:postId/comments` | Create comment on target post | Yes |

### Conversations & Messaging

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/conversations` | List conversation threads for current user | Yes |
| POST | `/api/v1/conversations` | Get or initialize 1-to-1 conversation | Yes |
| GET | `/api/v1/conversations/:id/messages` | Paginated conversation history | Yes |
| POST | `/api/v1/conversations/:id/messages` | Transmit message via REST fallback | Yes |
| POST | `/api/v1/conversations/:id/read` | Mark all conversation messages as read | Yes |

### Media Uploads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/uploads` | Upload media image file (multipart/form-data) | Yes |
| POST | `/api/v1/users/me/avatar` | Upload and set profile avatar | Yes |
| POST | `/api/v1/users/me/cover` | Upload and set profile header cover | Yes |

## WebSocket Endpoints

| Attribute | Specification |
|-----------|---------------|
| **Endpoint URL** | `ws://<host>:<port>/ws` or `wss://<host>:<port>/ws` |
| **Authentication** | URL query token (`/ws?token=<JWT>`) or `{ "type": "auth", "token": "<JWT>" }` |
| **Protocol** | Raw JSON frames over standard WebSockets |

### Frame Formats

#### Client → Server

| Type | Payload |
|------|---------|
| **Ping Keepalive** | `{ "type": "ping" }` |
| **Send Message** | `{ "type": "send_message", "conversationId": "12", "content": "Hello", "mediaUrl": null, "clientMessageId": "cmsg_01" }` |
| **Typing Indicator** | `{ "type": "typing", "conversationId": "12", "isTyping": true }` |
| **Mark As Read** | `{ "type": "mark_read", "conversationId": "12" }` |
| **Delivered Notice** | `{ "type": "message_delivered", "conversationId": "12", "messageId": "104" }` |

#### Server → Client

| Type | Payload |
|------|---------|
| **Authenticated** | `{ "type": "authenticated", "userId": "1" }` |
| **Pong** | `{ "type": "pong" }` |
| **Message Acknowledgment** | `{ "type": "message_ack", "clientMessageId": "cmsg_01", "message": { ... } }` |
| **Inbound Message** | `{ "type": "new_message", "conversationId": "12", "message": { ... } }` |
| **Message Delivered** | `{ "type": "message_delivered", "conversationId": "12", "messageId": "104" }` |
| **Messages Read** | `{ "type": "messages_read", "conversationId": "12", "readerId": "2", "readAt": "..." }` |
| **Typing Status** | `{ "type": "typing", "conversationId": "12", "userId": "2", "isTyping": true }` |

## Project Structure

nexora/
├── .env.example # Environment configuration template
├── package.json # Full-stack dependencies & scripts
├── tsconfig.json # TypeScript compiler configuration
├── vite.config.ts # Vite client build configuration
├── server.ts # Express gateway, API routes & WebSocket server
├── pom.xml # Maven specification for Java Spring Boot backend
├── uploads/ # Local media storage directory
│ ├── posts/
│ ├── profiles/
│ └── covers/
├── src/
│ ├── assets/
│ │ └── images/ # UI demo imagery & platform branding
│ ├── components/ # Reusable UI component modules
│ │ ├── MobileBottomNav.tsx # 44px+ mobile touch navigation
│ │ ├── Modals.tsx # Dialogs & confirmations
│ │ ├── Navbar.tsx # Universal top application header
│ │ ├── PostCard.tsx # Feed post rendering & actions
│ │ ├── PostComposer.tsx # Media-enabled post publisher
│ │ ├── RightSidebar.tsx # Trending tags & suggestion widgets
│ │ ├── Sidebar.tsx # Desktop & tablet navigation
│ │ └── ToastContainer.tsx # Notification toast dispatchers
│ ├── context/
│ │ └── AppContext.tsx # Global application state & WebSocket listeners
│ ├── pages/ # View routing components
│ │ ├── HomeDashboard.tsx # Primary social overview
│ │ ├── NewsFeedPage.tsx # Chronological feed stream
│ │ ├── MessagesPage.tsx # Real-time chat & conversation view
│ │ ├── ProfilePage.tsx # User profile & authored content
│ │ ├── SearchPage.tsx # Multi-criteria user discovery
│ │ ├── SettingsPage.tsx # Privacy, session & theme controls
│ │ ├── LoginPage.tsx # Authentication portal
│ │ ├── SignupPage.tsx # Account registration
│ │ └── OtpVerifyPage.tsx # 2FA OTP verification
│ ├── server/
│ │ ├── db.ts # PostgreSQL connection pool & data access layer
│ │ └── rateLimiter.ts # Route-level in-memory rate limiting
│ ├── services/
│ │ ├── api.ts # HTTP client & resilient WebSocket manager
│ │ └── mockData.ts # Seed models & fallback structures
│ └── types/
│ └── index.ts # Shared TypeScript interfaces & types
└── src/main/java/com/nexora/ # Enterprise Spring Boot 3 Backend
├── NexoraApplication.java # Spring Boot application entry point
├── auth/ # Spring Security & JWT controllers
├── user/ # User domain entities & services
├── post/ # Post publishing domain
├── message/ # Message repositories & controllers
├── comment/ # Post comment hierarchy
└── config/ # Spring Web & Security filters

text

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 19 (Functional Components, Hooks) |
| **Language** | TypeScript |
| **Build & Tooling** | Vite 8, tsx runtime |
| **Styling & Icons** | Tailwind CSS v4, Lucide React |
| **Motion & Micro-interactions** | Framer Motion |
| **Backend Runtime** | Node.js (Express Gateway) / Java 17 (Spring Boot 3.3.4) |
| **Real-Time Communication** | Native WebSockets (ws library) |
| **Database** | PostgreSQL (Neon Database Cluster) |
| **ORM / Data Access** | Node pg Pool (Parameterized SQL) / Hibernate Spring Data JPA |
| **Database Migrations** | Automated SQL Table Migrations / Flyway DB |
| **Authentication** | JSON Web Tokens (jsonwebtoken), bcryptjs |
| **File Processing** | Multer Disk Storage |

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm or bun**: npm v9+ or bun v1.1+
- **PostgreSQL**: Accessible PostgreSQL instance or Neon database URL
- **(Optional for Java Backend)**: JDK 17+ and Apache Maven 3.8+

### Setup Instructions

1. **Clone the repository**:

```bash
git clone [https://github.com/your-username/nexora.git](https://github.com/your-username/nexora.git)
cd nexora
```

2. **Configure environment variables**:

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Define the following variables:

```env
DATABASE_URL="postgresql://username:password@your-host:5432/neondb?sslmode=require"
JWT_SECRET="your_secure_random_jwt_secret_key"
PORT=3000
```

3. **Install dependencies**:

```bash
npm install
```

4. **Launch the development server**:

```bash
npm run dev
```

The application will initialize database tables, execute migrations, and serve the application on `http://localhost:3000`.

5. **(Optional) Running the Spring Boot Backend**:

```bash
mvn clean install
mvn spring-boot:run
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql://user:pass@host/db`) |
| `JWT_SECRET` | Yes | Secret cryptographic key used to sign and verify JWT tokens |
| `PORT` | No | Server listener port (defaults to 3000) |
| `GEMINI_API_KEY` | No | Google GenAI API key for optional smart assistant features |
| `APP_URL` | No | Base application host URL for absolute URL generation |

## Engineering Highlights

- **Dual-Delivery Chat Pipeline**: Employs WebSockets as the primary sub-millisecond transport for messages, while simultaneously supporting transparent HTTP API fallbacks if client sockets experience transient degradation.
- **Heartbeat-Guarded Socket Connections**: Implements bi-directional keepalive heartbeats (ping/pong), ensuring reverse proxies and container orchestrators do not drop idle communication sessions.
- **Idempotent Socket Processing**: Client message UUIDs (`clientMessageId`) prevent duplicate message persistence during socket reconnections and network retries.
- **Intelligent Feed Reconciliation**: Feed synchronization merges remote server payloads with locally composed content, preserving unsynchronized and optimistic records during background polling.
- **Column-Level Size Hardening**: Schema migrations dynamically enforce TEXT data types across `media_url` and `avatar` properties, permitting both remote URLs and inline data URIs without truncation.
- **Zero-Polling Active Presence**: Uses connection registry tracking (`userSockets.has(userId)`) to provide accurate presence indicators without database query loops.

## Design & UX

- **Responsive Density**: Automatically adapts layout structure from a compact three-column engineering dashboard on desktop (≥ 1024px) to an icon-only navigation mode on tablet, and a thumb-friendly bottom bar on mobile (< 768px).
- **Obsidian Palette**: Dark mode styling built with deliberate contrast ratios, clean border delineations, and monospace accents for numeric telemetry.
- **Micro-Interactions**: Interactive bounce animations on like toggles, bookmark triggers, and skeleton loading states during feed fetch sequences.
- **Accessible State Handling**: Distinct visual representations for empty states, missing conversation histories, connection drops, and validation errors.

## Future Improvements

The following capabilities represent planned architectural enhancements:

- **Distributed Socket Pub/Sub**: Integration of Redis Pub/Sub to scale WebSocket connections horizontally across multi-node clusters.
- **S3 / Cloud Object Storage**: Migration of uploaded media from local container disk storage to Cloud Storage buckets (S3 / GCS).
- **Group Conversations**: Expanding the conversation schema to support multi-party group channels and member role governance.
- **Push Notification Workers**: Web Push API workers to deliver offline notification badges and background messaging alerts.
- **Message Reactions**: Polymorphic reaction structures for chat messages.

## Author

**Platform Architect & Developer**: Shivam Kumar  
📧 shivjjj1710@gmail.com  
👤 Demo Identity: `@shivam_dev`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
