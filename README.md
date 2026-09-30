NEXORA
NEXORA is a full-stack social networking and real-time communication platform engineered
with a decoupled architecture, relational persistence, and bidirectional WebSocket
communication. It provides secure JWT authentication, multi-criteria user discovery,
chronological social feeds, interactive media publishing, and persistent 1-to-1 direct messaging
with delivery status tracking.
Overview
Modern social platforms require high responsiveness for interactions, persistent relational
integrity for user relationships, and low-latency bidirectional channels for direct messaging.
NEXORA was architected to address these engineering requirements without reliance on
synthetic polling or unauthenticated mock state.
Key Capabilities
Identity & Account Lifecycle: Multi-stage account creation with bcrypt password hashing,
6-digit OTP verification, and JWT session authorization.
Social Graph & Discovery: Follow/unfollow mechanics, real-time prefix search across
usernames and display names, bookmarking, and so-delete content moderation.
Publishing & Media Feed: Chronological activity streams supporting multiline text,
hashtag tokenization, and photo attachments with client-side preview and server-side disk
storage.
Real-Time Direct Messaging: Persistent 1-to-1 messaging built over WebSockets with
ping/pong keepalive heartbeats, optimistic client-side dispatch, and delivery state tracking.
Universal Multi-Device Layout: Three-column desktop interface, collapsible tablet
navigation, and mobile bottom navigation with safe-area spacing.
Screenshots / Demo
<p align="center">
<img src="src/assets/images/hero_social_preview_1790446483047.jpg" alt="NEXORA Platform
Overview" width="800" />
</p>
Interface Previews
Feed & Post Creation
<
img
src="src/assets/images/post_photo_tech_1790446531677.jpg"
alt="Feed & Media Publishing" width="400" />
Interactive Workspace
<
img
src="src/assets/images/group_banner_dev_1790446548511.jpg"
alt="Community & Engineering Hubs" width="400" />
Core Features
Authentication & Access Control
User Registration: Input validation, duplicate username/email checks, and salted bcrypt
password hashing (10 salt rounds).
Two-Factor OTP Verification: 6-digit cryptographic verification codes with 10-minute
expiry and attempt limiting.
JWT Session Tokens: Cryptographically signed access tokens transmitting user identities
over standard HTTP Authorization: Bearer headers.
Session Auto-Provisioning: Automated bootstrap session negotiation for instant platform
exploration.
Social Interaction & Graph
User Profiles: Custom avatars, banners, bios, technical interests, work experience, and
location metadata.
Relationship Mechanics: Asymmetric follow/unfollow operations with mutual relationship
tracking and self-follow guards.
Chronological News Feed: Multi-criteria feed filtering (All Activity, Following Only, Media
Only) with so-deleted record exclusion.
Post Interactions: Real-time post creation, inline content editing, author-only deletion,
hashtag extraction, and atomic like/bookmark toggles.
Comment Threads: Nested comment structures linked directly to root posts with cascading
deletions.
User Search: Server-side SQL pattern-matching (ILIKE) searching across usernames and
display names with debounce controls.
Real-Time Direct Messaging
Dedicated WebSocket Channel: Bidirectional socket server mounted on 
frames.
/ws using native
Connection Heartbeats: 20-second client-side ping intervals paired with 25-second server
watchdog sweeps to prevent reverse-proxy timeout drops.
Auto-Reconnection: Exponential backoff reconnect algorithm with random jitter, re
establishing connections on network reconnection and tab visibility events.
Optimistic UI Dispatch: Immediate local message rendering with temporary client IDs,
reconciling with server database IDs upon acknowledgment.
Delivery & Read States: Live message status tracking transitions (sent → delivered → read).
Typing Indicators: Ephemeral typing events broadcast to conversation participants
without database disk writes.
Multipart File Uploads: Multer disk storage handling profile avatars, cover images, and
post attachments under /uploads.
MIME & Extension Guards: Whitelist validation for .jpg, .jpeg, .png, .webp, and .gif
formats with 10MB payload thresholds.
Resilient Fallback: Client-side FileReader base64 fallback pipeline ensuring media
availability across ephemeral execution environments.
NEXORA employs a decoupled layered architecture separating persistent storage, server-side
business logic, WebSocket dispatchers, and reactive client components.
[ Web Browser / Mobile Client (React 19 + TypeScript + Vite) ]
          
│
                                  
│
          
│
 HTTP / REST                      
│
 WebSocket (/ws)
          
▼
                                  
▼
[ Express Application Gateway & API Server (Node.js / tsx) ]
          
│
                                  
│
          
├──
 Rate Limiting (In-Memory)      
├──
 Heartbeat Monitor (25s ping/pong)
          
├──
 JWT Authentication Middleware  
├──
 Connection Map (userSockets)
          
├──
 Multer Media Storage Handler   
└──
 Real-time Event Router
          
│
                                  
│
          
└────────────────┬─────────────────┘
                           
│
                           
▼
 (Connection Pooling / Parameterized SQL)
             [ PostgreSQL Database (Neon Cluster) ]
Built with React 19, TypeScript, Tailwind CSS, and Framer Motion.
Manages local client state, optimistic UI mutations, and persistent offline mirrors in
localStorage.
Maintains a single WebSocket connection singleton with automatic lifecycle management
and queue buffering.
Serves static assets, compiled bundles, and uploaded media files.
Enforces security boundaries: token verification, route rate limiting, and request
sanitization.
Exposes RESTful endpoints conforming to standard HTTP status codes.
Media & File Management
Architecture
System Component Responsibilities
Client Tier (Frontend SPA)
Gateway Tier (Express & Vite Middleware)
Real-Time Tier (WebSocket Server)
Manages active socket instances via a synchronized multi-socket map (
userSockets:
Map<string, WebSocket[]>).
Authenticates socket sessions via query parameters or explicit 
handshake payloads.
{ type: 'auth', token }
Forwards delivery acknowledgments and broadcasts events to targeted client sessions.
Persistence Tier (PostgreSQL)
Relational database schema with primary foreign key constraints and cascade rules.
Connection pooling managed through 
SQL injection vulnerabilities.
pg.Pool utilizing parameterized queries to eliminate
Note: The repository also includes a complete enterprise Java 17 / Spring Boot 3.3.4
microservice architecture located under 
src/main/java/com/nexora with Spring
Security, Spring Data JPA, and Flyway migrations (
pom.xml).
Real-Time Messaging Architecture
The direct messaging subsystem is architected to decouple real-time socket transport from
persistent relational storage.
[ Client A ]                  
│
                                
[ Server Gateway ]               
│
                             
│
 
──
 1. send_message (WS) 
─────
> 
│
                             
│
                                
│
                                
│
                                
├──
 2. Verify Session         
│
 <
──
 4. message_ack (WS) 
───────┤
                             
│
                                
│
                                
[ Client B ]
│
│
│
├──
 3. Persist to PostgreSQL  
│
│
                             
│
│
│
 
──
 5. new_message (WS) 
───
> 
│
│
 <
──
 6. mark_delivered 
─────┤
│
 <
──
 7. message_delivered 
──────┤
                             
Protocol & Flow Specifications
Authentication Handshake
1. The client opens a connection to 
/ws?token=<JWT>.
│
2. The server decodes the token claims and binds the active socket to the internal user
registry:
{ "type": "authenticated", "userId": "1" }
Heartbeat & Keepalive Protocol
Every 20 seconds, the client transmits 
{ "type": "ping" }.
The server resets its socket watchdog and returns 
{ "type": "pong" }.
If a connection drops, buffered outbound messages remain in memory until the handshake
completes.
Message Persistence & Broadcast
Outbound payloads transmit conversation IDs, content, optional media URLs, and client
generated UUIDs:
{
}
"type": "send_message",
"conversationId": "14",
"content": "Reviewing system architecture.",
"clientMessageId": "cmsg_1790753085"
1. The gateway writes the record into the 
2. The gateway emits a 
messages table via a database transaction.
message_ack frame back to Client A.
3. If Client B is registered in 
userSockets, the gateway pushes 
B's active sockets.
new_message directly to Client
4. When Client B renders the frame, it acknowledges delivery, triggering a status update to
Client A.
Dual Transport Redundancy
If the WebSocket channel drops unexpectedly, 
ApiService routes outbound messages via
HTTP POST 
/api/v1/conversations/:id/messages without interrupting user composition.
Security
Password Hashing: Passwords stored as salted hashes using 
Plaintext credentials are never persisted.
bcryptjs with 10 salt rounds.
Stateless Authorization: Protected endpoints require a valid JSON Web Token passed via
Authorization: Bearer <token>.
$1, $2, ...) via 
Parameterized SQL Execution: All database queries executed through parameterized
placeholders (
pg.Pool, mitigating SQL injection risks.
Resource Ownership Validation: Mutation requests (deleting posts, updating profiles)
strictly verify that 
author_id === req.user.userId.
Conversation Access Control: Membership validation checks verify that users belong to a
conversation prior to reading or transmitting messages.
Input Sanitization: User-submitted strings pass through script-tag sanitizers and length
capping routines.
Granular Rate Limiting
In-memory rate limiting applied per route category:
Endpoint Category
Authentication / Login
Rate Limit
5 requests / min
OTP Verification
5 requests / 10 min
Post Creation
Direct Messaging
20 requests / min
30 requests / min
Search
Database Design
60 requests / min
The schema is defined in PostgreSQL with relational integrity, foreign keys, and indexes.
┌──────────────┐
             
│
    
users     
┌──────────────┐
│
1 
─────────
 1
│
   profiles   
│
└──────┬───────┘
             
│
1
├───────────┐
│
           
*
│
          
└──────────────┘
│
*
│
┌──────┴───────┐
 
┌─┴────────────┐
│
    
posts     
│
 
│
   follows    
│
└──────┬───────┘
 
└──────────────┘
│
1
├───────────┐
│
           
│
*
│
          
*
│
┌──────┴───────┐
 
┌─┴────────────┐
│
   
comments   
│
 
│
    likes     
│
└──────────────┘
 
└──────────────┘
┌──────────────┐
1           
*
┌──────────────┐
│
conversations 
│─────────────│
conv_members  
│
└──────┬───────┘
             
│
1
│
*
┌──────┴───────┐
│
   
messages   
│
└──────────────┘
Entity Specifications
Table
└──────────────┘
Base identity storing 
Description
id (BIGSERIAL), unique 
username, unique 
users
password_hash, verification status, and 
email,
role.
Table Description
profiles User metadata containing display_name, bio, location, website,
avatar_url, and cover_image_url.
posts Published content records containing author_id, content, media_url (TEXT),
visibility, likes_count, and deleted so-delete flags.
comments Comment items containing post_id, author_id, parent_comment_id, and
content.
likes Post like records with a unique composite constraint (post_id, user_id).
bookmarks Saved post references with a unique composite constraint (post_id, user_id).
follows Social graph relations with composite uniqueness (follower_id, following_id) and
check constraints prohibiting self-following.
conversations Chat thread roots tracking creation and update timestamps.
conversation_members Join table binding user_id to conversation_id with composite primary constraints
and read receipt timestamps.
messages
Chat messages storing conversation_id, sender_id, content, media_url,
client_message_id, and delivery timestamps.
Method Endpoint Description
Auth
Required
POST /api/v1/auth/register
Register new account and generate verification
OTP
No
POST /api/v1/auth/verify-otp Validate 6-digit OTP and issue JWT access token No
POST /api/v1/auth/login
Authenticate credentials and issue JWT access
token
No
GET
/api/v1/auth/default
session
Provision default guest session credentials No
POST
/api/v1/auth/change
password
Update account password Yes
GET /api/v1/auth/me Fetch active authenticated identity payload Yes
Method Endpoint Description
Auth
Required
GET /api/v1/users/:username Retrieve full public profile by username Optional
PUT /api/v1/users/me Update authenticated profile metadata Yes
API Overview
Authentication
User Profiles & Social Graph
Method Endpoint Description
Auth
Required
POST /api/v1/users/:userId/follow Follow target user Yes
DELETE /api/v1/users/:userId/follow Unfollow target user Yes
GET /api/v1/search/users
Prefix search across usernames and display
names
Optional
POST /api/v1/users/:userId/block Block target user Yes
Method Endpoint Description
Auth
Required
GET /api/v1/feed Paginated chronological feed retrieval Optional
POST /api/v1/posts Publish a new post with optional media
attachment
Yes
DELETE /api/v1/posts/:id So-delete owned post Yes
POST /api/v1/posts/:postId/like Toggle post like Yes
DELETE /api/v1/posts/:postId/like Remove post like Yes
POST /api/v1/posts/:postId/comments Create comment on target post Yes
Method Endpoint Description
Auth
Required
GET /api/v1/conversations
List conversation threads for current
user
Yes
POST /api/v1/conversations Get or initialize 1-to-1 conversation Yes
GET /api/v1/conversations/:id/messages Paginated conversation history Yes
POST /api/v1/conversations/:id/messages Transmit message via REST fallback Yes
POST /api/v1/conversations/:id/read
Mark all conversation messages as
read
Yes
Method Endpoint Description Auth Required
POST /api/v1/uploads Upload media image file (multipart/form-data) Yes
POST /api/v1/users/me/avatar Upload and set profile avatar Yes
POST /api/v1/users/me/cover Upload and set profile header cover Yes
Posts, Feed & Interactions
Conversations & Messaging
Media Uploads
Attribute Specification
Endpoint URL ws://<host>:<port>/ws or wss://<host>:<port>/ws
Authentication URL query token (/ws?token=<JWT>) or { "type": "auth", "token": "<JWT>" }
Protocol Raw JSON frames over standard WebSockets
Type Payload
Ping
Keepalive
{ "type": "ping" }
Send
Message
{ "type": "send_message", "conversationId": "12", "content":
"Hello", "mediaUrl": null, "clientMessageId": "cmsg_01" }
Typing
Indicator
{ "type": "typing", "conversationId": "12", "isTyping": true }
Mark As
Read
{ "type": "mark_read", "conversationId": "12" }
Delivered
Notice
{ "type": "message_delivered", "conversationId": "12", "messageId":
"104" }
Type Payload
Authenticated { "type": "authenticated", "userId": "1" }
Pong { "type": "pong" }
Message
Acknowledgment
{ "type": "message_ack", "clientMessageId": "cmsg_01",
"message": { ... } }
Inbound Message
{ "type": "new_message", "conversationId": "12", "message": {
... } }
Message Delivered
{ "type": "message_delivered", "conversationId": "12",
"messageId": "104" }
Messages Read
{ "type": "messages_read", "conversationId": "12",
"readerId": "2", "readAt": "..." }
Typing Status
{ "type": "typing", "conversationId": "12", "userId": "2",
"isTyping": true }
WebSocket Endpoints
Frame Formats
Client → Server
Server → Client
Project Structure
nexora/
├──
 .env.example                      
├──
 package.json                      
├──
 tsconfig.json                     
├──
 vite.config.ts                    
├──
 server.ts                         
├──
 pom.xml                           
├──
 uploads/                          
│
   
│
   
│
   
├──
 posts/
├──
 profiles/
└──
 covers/
├──
 src/
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
       
├──
 assets/
│
   
└──
 images/                   
├──
 components/                   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
├──
 MobileBottomNav.tsx       
├──
 Modals.tsx                
├──
 Navbar.tsx                
├──
 PostCard.tsx              
├──
 PostComposer.tsx          
├──
 RightSidebar.tsx          
├──
 Sidebar.tsx               
└──
 ToastContainer.tsx        
├──
 context/
│
   
└──
 AppContext.tsx            
├──
 pages/                        
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
│
   
├──
 HomeDashboard.tsx         
├──
 NewsFeedPage.tsx          
├──
 MessagesPage.tsx          
├──
 ProfilePage.tsx           
├──
 SearchPage.tsx            
├──
 SettingsPage.tsx          
├──
 LoginPage.tsx             
├──
 SignupPage.tsx            
└──
 OtpVerifyPage.tsx         
├──
 server/
│
   
│
   
├──
 db.ts                     
└──
 rateLimiter.ts            
├──
 services/
│
   
│
   
├──
 api.ts                    
└──
 mockData.ts               
└──
 types/
# Environment configuration template
# Full-stack dependencies & scripts
# TypeScript compiler configuration
# Vite client build configuration
# Express gateway, API routes & WebSocket serve
# Maven specification for Java Spring Boot back
# Local media storage directory
# UI demo imagery & platform branding
# Reusable UI component modules
# 44px+ mobile touch navigation
# Dialogs & confirmations
# Universal top application header
# Feed post rendering & actions
# Media-enabled post publisher
# Trending tags & suggestion widgets
# Desktop & tablet navigation
# Notification toast dispatchers
# Global application state & WebSocket listener
# View routing components
# Primary social overview
# Chronological feed stream
# Real-time chat & conversation view
# User profile & authored content
# Multi-criteria user discovery
# Privacy, session & theme controls
# Authentication portal
# Account registration
# 2FA OTP verification
# PostgreSQL connection pool & data access laye
# Route-level in-memory rate limiting
# HTTP client & resilient WebSocket manager
# Seed models & fallback structures
└──
 index.ts                  
└──
 src/main/java/com/nexora/         
├──
 NexoraApplication.java        
├──
 auth/                         
├──
 user/                         
├──
 post/                         
├──
 message/                      
├──
 comment/                      
└──
 config/                       
# Shared TypeScript interfaces & types
# Enterprise Spring Boot 3 Backend
# Spring Boot application entry point
# Spring Security & JWT controllers
# User domain entities & services
# Post publishing domain
# Message repositories & controllers
# Post comment hierarchy
# Spring Web & Security filters
Tech Stack
Technology
Layer
Frontend Framework
Language
React 19 (Functional Components, Hooks)
TypeScript
Build & Tooling
Styling & Icons
Vite 8, tsx runtime
Tailwind CSS v4, Lucide React
Motion & Micro-interactions
Backend Runtime
Framer Motion
Node.js (Express Gateway) / Java 17 (Spring Boot 3.3.4)
Real-Time Communication
Database
Native WebSockets (ws library)
PostgreSQL (Neon Database Cluster)
ORM / Data Access
Database Migrations
Node pg Pool (Parameterized SQL) / Hibernate Spring Data JPA
Automated SQL Table Migrations / Flyway DB
Authentication
File Processing
JSON Web Tokens (jsonwebtoken), bcryptjs
Multer Disk Storage
Getting Started
Prerequisites
Node.js: v18.0.0 or higher
npm or bun: npm v9+ or bun v1.1+
PostgreSQL: Accessible PostgreSQL instance or Neon database URL
(Optional for Java Backend): JDK 17+ and Apache Maven 3.8+
Setup Instructions
1. Clone the repository:
git clone https://github.com/your-username/nexora.git
cd nexora
2. Configure environment variables:
Create a 
.env file in the project root:
cp .env.example .env
Define the following variables:
DATABASE_URL="postgresql://username:password@your-host:5432/neondb?sslmode=require"
JWT_SECRET="your_secure_random_jwt_secret_key"
PORT=3000
3. Install dependencies:
npm install
4. Launch the development server:
npm run dev
The application will initialize database tables, execute migrations, and serve the application on
http://localhost:3000.
5. (Optional) Running the Spring Boot Backend:
mvn clean install
mvn spring-boot:run
Environment Variables
Variable
DATABASE_URL
JWT_SECRET
PORT
GEMINI_API_KEY
APP_URL
Required
Yes
Yes
No
No
No
Engineering Highlights
Description
PostgreSQL connection string (
postgresql://user:pass@host/db)
Secret cryptographic key used to sign and verify JWT tokens
Server listener port (defaults to 3000)
Google GenAI API key for optional smart assistant features
Base application host URL for absolute URL generation
Dual-Delivery Chat Pipeline: Employs WebSockets as the primary sub-millisecond
transport for messages, while simultaneously supporting transparent HTTP API fallbacks if
client sockets experience transient degradation.
Heartbeat-Guarded Socket Connections: Implements bi-directional keepalive heartbeats
(ping/pong), ensuring reverse proxies and container orchestrators do not drop idle
communication sessions.
Idempotent Socket Processing: Client message UUIDs (
clientMessageId) prevent duplicate
message persistence during socket reconnections and network retries.
Intelligent Feed Reconciliation: Feed synchronization merges remote server payloads with
locally composed content, preserving unsynchronized and optimistic records during
background polling.
media_url and 
Column-Level Size Hardening: Schema migrations dynamically enforce TEXT data types
across 
avatar properties, permitting both remote URLs and inline data URIs
without truncation.
Zero-Polling Active Presence: Uses connection registry tracking (
userSockets.has(userId))
to provide accurate presence indicators without database query loops.
Design & UX
Responsive Density: Automatically adapts layout structure from a compact three-column
engineering dashboard on desktop (≥ 1024px) to an icon-only navigation mode on tablet,
and a thumb-friendly bottom bar on mobile (< 768px).
Obsidian Palette: Dark mode styling built with deliberate contrast ratios, clean border
delineations, and monospace accents for numeric telemetry.
Micro-Interactions: Interactive bounce animations on like toggles, bookmark triggers, and
skeleton loading states during feed fetch sequences.
Accessible State Handling: Distinct visual representations for empty states, missing
conversation histories, connection drops, and validation errors.
Future Improvements
The following capabilities represent planned architectural enhancements:
Distributed Socket Pub/Sub: Integration of Redis Pub/Sub to scale WebSocket connections
horizontally across multi-node clusters.
S3 / Cloud Object Storage: Migration of uploaded media from local container disk storage to
Cloud Storage buckets (S3 / GCS).
Group Conversations: Expanding the conversation schema to support multi-party group
channels and member role governance.
Push Notification Workers: Web Push API workers to deliver offline notification badges and
background messaging alerts.
Message Reactions: Polymorphic reaction structures for chat messages.
Author
Platform Architect & Developer: Shivam Kumar
shivjjj1710@gmail.com
Demo Identity: 
@shivam_dev
License
This project is licensed under the MIT License - see the 
LICENSE file for details
