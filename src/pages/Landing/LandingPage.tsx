import { motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Compass,
  Heart,
  Layers,
  MessageCircle,
  Play,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createEditorialPostVisual } from '../../assets/visuals';
import { Avatar } from '../../components/common/Avatar';
import { NexoraLogo } from '../../components/common/NexoraLogo';
import { useNexora } from '../../context/NexoraContext';

export function LandingPage() {
  const { currentUser, users, loginDemo } = useNexora();
  const navigate = useNavigate();

  const handleOpenApp = () => {
    if (!currentUser) {
      loginDemo();
    }
    navigate('/home');
  };

  const featuredCreators = users.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC]">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#252D3A]/80 bg-[#090B10]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <Link to="/" className="whitespace-nowrap shrink-0">
            <NexoraLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#94A3B8]">
            <a
              href="#features"
              className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
            <a
              href="#stories-showcase"
              className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              Stories
            </a>
            <a
              href="#creators"
              className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              Creators
            </a>
            <Link
              to="/login"
              className="hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              Sign in
            </Link>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleOpenApp}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              Open App
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#252D3A]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <p className="text-xs font-medium tracking-wide text-[#06B6D4]">
              Connect · Create · Discover
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.08] text-[#F8FAFC]">
              Your World. Your Connections.
            </h1>
            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-xl">
              NEXORA brings ephemeral visual stories, focused creator conversations, and
              interest-driven communities together in a calm, dark-first social interface.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => navigate(currentUser ? '/home' : '/register')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 active:scale-[0.98] transition-all inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleOpenApp}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-[#F8FAFC] border border-[#252D3A] bg-[#141A24] hover:border-[#8B5CF6] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#06B6D4]" />
                <span>Explore Nexora</span>
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Interactive frontend demonstration running locally in your browser with
              LocalStorage &amp; IndexedDB persistence.
            </p>
          </motion.div>

          {/* Product Preview Surface */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="rounded-2xl border border-[#252D3A] bg-[#0E121A] p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  {featuredCreators.map((creator, idx) => (
                    <div key={creator.id} className="flex flex-col items-center gap-1 shrink-0">
                      <Avatar
                        src={creator.avatar}
                        name={creator.fullName}
                        size="md"
                        ringState={idx < 3 ? 'unseen' : 'seen'}
                      />
                      <span className="text-[10px] text-[#94A3B8]">
                        {creator.fullName.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleOpenApp}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A2230] border border-[#252D3A] text-[#06B6D4] hover:border-[#06B6D4] transition-colors whitespace-nowrap shrink-0"
                >
                  Launch Feed
                </button>
              </div>

              <div className="rounded-xl border border-[#252D3A] bg-[#141A24] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={featuredCreators[3]?.avatar}
                      name={featuredCreators[3]?.fullName || 'Elena Rostova'}
                      size="sm"
                      verified
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">
                        {featuredCreators[3]?.fullName || 'Elena Rostova'}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        @elena.ux · 52m · Design
                      </p>
                    </div>
                  </div>
                  <Bookmark className="w-4 h-4 text-[#8B5CF6]" />
                </div>

                <p className="text-sm text-[#E2E8F0] leading-relaxed">
                  Published our 4-tier dark surface elevation tokens today. Clean hierarchy
                  keeps focus on creator work instead of chrome.
                </p>

                <div className="overflow-hidden rounded-xl border border-[#252D3A]">
                  <img
                    src={createEditorialPostVisual('design_system')}
                    alt="NEXORA dark elevation token preview"
                    className="w-full h-44 sm:h-52 object-cover"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-1">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-[#EF4444]">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span className="tabular-nums">128</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="tabular-nums">24</span>
                    </span>
                  </div>
                  <span className="text-[#06B6D4]">#DesignSystems</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Features Bento Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-medium text-[#8B5CF6] mb-2">Platform Architecture</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            Built for expressive sharing without visual noise.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 rounded-2xl border border-[#252D3A] bg-[#141A24] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#F8FAFC]">
              01. Structured Social Feed &amp; Multi-Media Composer
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
              Publish multi-image or short video updates, clickable #hashtags, @mentions,
              nested comment threads, and bookmarked collections. Every interaction updates
              instantly with persistent browser storage.
            </p>
          </div>

          <div className="rounded-2xl border border-[#252D3A] bg-[#141A24] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#F8FAFC]">
              02. Creator Studio
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Track locally calculated engagement trends, follower activity charts, and
              top-performing posts with crisp Recharts visualizations.
            </p>
          </div>

          <div className="rounded-2xl border border-[#252D3A] bg-[#141A24] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#F8FAFC]">
              03. Focused Communities
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Join topic-driven spaces like React Developers, UI/UX Designers, and
              Photography Lovers with dedicated feeds and member directories.
            </p>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-[#252D3A] bg-[#141A24] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#F8FAFC]">
              04. IndexedDB Media &amp; Profile Highlights
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
              Uploaded photos and short videos are persisted directly inside your
              browser’s IndexedDB, while curated Story Highlights pin your best moments to
              your profile permanently.
            </p>
          </div>
        </div>
      </section>

      {/* Stories Showcase */}
      <section
        id="stories-showcase"
        className="border-y border-[#252D3A]/80 bg-[#0E121A]/70 py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[300px] aspect-[9/16] rounded-2xl border border-[#252D3A] bg-[#090B10] overflow-hidden shadow-2xl">
              <img
                src={createEditorialPostVisual('story_evening')}
                alt="NEXORA Stories mobile viewer preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 p-3.5 bg-gradient-to-b from-black/80 to-transparent space-y-2.5">
                <div className="grid grid-cols-3 gap-1">
                  <div className="h-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]" />
                  <div className="h-1 rounded-full bg-white/30" />
                  <div className="h-1 rounded-full bg-white/30" />
                </div>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={featuredCreators[0]?.avatar}
                    name={featuredCreators[0]?.fullName || 'Alex Chen'}
                    size="xs"
                  />
                  <span className="text-xs font-semibold text-white">Alex Chen · 2h</span>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                <p className="text-xs text-[#F8FAFC] leading-relaxed">
                  Late evening build session — polishing the Nexora Stories viewer.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-medium text-[#06B6D4]">24-Hour Ephemeral Canvas</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F8FAFC]">
              Stories built for photo, video, and typographic moments.
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              Compose vertical photo stories, short video clips, or gradient text cards
              with privacy tiers (Public, Followers, or Close Friends). Navigate segments
              with keyboard arrows, touch swipes, emoji reactions, and direct replies.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-[#252D3A] bg-[#141A24] p-4">
                <p className="text-sm font-semibold text-[#F8FAFC]">
                  Timed Multi-Segment Playback
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  5-second image pacing and adaptive video progress bars with instant pause
                  and mute controls.
                </p>
              </div>
              <div className="rounded-xl border border-[#252D3A] bg-[#141A24] p-4">
                <p className="text-sm font-semibold text-[#F8FAFC]">
                  Reactions, Replies &amp; Highlights
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Inspect story viewers, collect emoji reactions, reply in-thread, and pin
                  favorites as Profile Highlights.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenApp}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Try Stories in Live App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Community Section */}
      <section id="creators" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium text-[#8B5CF6] mb-2">Creator Ecosystem</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              Meet the builders and visual artists on NEXORA.
            </h2>
          </div>
          <button
            type="button"
            onClick={handleOpenApp}
            className="text-sm font-semibold text-[#06B6D4] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            Browse all creators →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCreators.map((creator) => (
            <div
              key={creator.id}
              className="rounded-2xl border border-[#252D3A] bg-[#141A24] p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <Avatar
                  src={creator.avatar}
                  name={creator.fullName}
                  size="lg"
                  verified={creator.verified}
                />
                <div>
                  <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                    {creator.fullName}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    @{creator.username} · {creator.roleTitle}
                  </p>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                  {creator.bio}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) loginDemo();
                  navigate(`/profile/${creator.username}`);
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold border border-[#252D3A] text-[#F8FAFC] hover:border-[#8B5CF6] transition-colors"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#252D3A] bg-[#0E121A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <NexoraLogo size="sm" />
            <p className="text-xs text-[#64748B] max-w-md">
              Frontend-only social networking demonstration. Data, media uploads,
              messaging, and analytics are stored locally in your browser.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#94A3B8]">
            <Link to="/login" className="hover:text-[#F8FAFC]">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-[#F8FAFC]">
              Create Account
            </Link>
            <button type="button" onClick={handleOpenApp} className="hover:text-[#F8FAFC]">
              Open App
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
