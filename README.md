# NEXORA — Next-Generation Social Networking Platform

**Tagline:** *Connect. Create. Discover.*

NEXORA is a complete, frontend-only social networking web application built with React, TypeScript, Tailwind CSS, React Router, Recharts, and Framer Motion. It provides an interactive dark-first social experience with local persistence powered by `LocalStorage` and `IndexedDB`.

> **Important Disclosure:** NEXORA is a browser-local frontend demonstration. Authentication, messaging, notifications, media uploads, and creator analytics run locally in your browser without an external backend, remote database, or cross-device synchronization.

---

## Core Features

- **Landing Experience (`/`)**: Product introduction, live interactive preview, asymmetric feature breakdown, Stories showcase, and featured creators.
- **Local Authentication (`/login`, `/register`)**: Zod-validated registration with username uniqueness checking, live password strength indicator, password visibility toggle, and 1-click demo sign-in (`alex@nexora.dev` / `Demo@1234`).
- **Home Feed (`/home`)**: Responsive 3-column desktop shell & mobile thumb navigation, feed filters (`For You`, `Following`, `Latest`, `Media`), inline post composer, pagination, and full post interactions (like, comment, nested reply, delete, edit, bookmark, share, copy link, demo report).
- **24-Hour Stories System**:
  - Horizontal Stories bar with unseen/seen purple-to-cyan gradient rings.
  - **Create Story** modal supporting image upload, short video upload (via IndexedDB), and styled text cards with captions, emojis, and audience privacy (`Public`, `Followers`, `Close Friends`).
  - **Full-Screen Story Viewer** with timed progress indicators (5s images / adaptive video duration), pause/resume, mute/unmute, keyboard arrow/Escape shortcuts, mobile touch swipe, emoji reactions, story replies, and viewer counts.
- **Explore & Search (`/explore`, `/search`)**: Category filtering, trending hashtags, popular creators, recent search history, and live filtering across people, posts, hashtags, and communities.
- **Profiles & Follow Graph (`/profile`, `/profile/edit`, `/profile/:username`)**: Cover/avatar IndexedDB uploads, bio/location/website editing, follower & following modals, Close Friends toggle, and `Posts` / `Replies` / `Media` / `Liked` tabs.
- **Messaging (`/messages`)**: Responsive desktop split layout and dedicated mobile chat view with conversation search, new chat picker, emoji insertion, and message deletion.
- **Communities (`/communities`)**: Join/leave topic communities and publish posts directly inside community spaces.
- **Creator Dashboard (`/dashboard`)**: Locally computed KPI metrics and Recharts area/bar visualizations.
- **Settings (`/settings`)**: Dark/Light mode switcher, default story privacy, notification preferences, local password demo update, and one-click Reset Demo Data.

---

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS v4 (`Space Grotesk` headings, `Inter` body, `JetBrains Mono` tabular numerals)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms & Validation:** React Hook Form + Zod
- **Animations:** Motion (`motion/react`) with `prefers-reduced-motion` support
- **Local Persistence:** `LocalStorage` (structured state) + `IndexedDB` (uploaded image/video blobs)

---

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Type-check:

```bash
npm run lint
```

---

## Vercel Deployment

For SPA client-side routing on Vercel, `vercel.json` is included to rewrite non-asset routes cleanly to `index.html`. Run `npm run build` as the build command and `dist` as the output directory.
