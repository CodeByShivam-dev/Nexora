import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  MessageSquare,
  Users,
  ShieldCheck,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-[var(--primary)] shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Generation Social Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text)] leading-[1.1] text-balance">
                Connect. Share. Discover.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Build meaningful connections, share what matters, and discover vibrant communities around your interests. Zero clutter. Pure connection.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigate('signup')}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all hover:scale-[1.02]"
                >
                  <span>Create Your Account</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('home')}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold text-[var(--text)] shadow-xs hover:bg-[var(--surface-secondary)] transition-all"
                >
                  Explore Nexora
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-[var(--border)] flex items-center justify-center lg:justify-start gap-6 text-xs text-[var(--muted)]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Frontend-first Architecture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Privacy Focused</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Zero Ads Clutter</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Preview */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-all">
                  {/* Mock Social Header in preview */}
                  <div className="border-b border-[var(--border)] bg-[var(--surface-secondary)]/60 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--muted)]">nexora.network/feed</span>
                    <div className="w-10" />
                  </div>

                  {/* Image Preview */}
                  <img
                    src="/src/assets/images/hero_social_preview_1790446483047.jpg"
                    alt="Nexora Platform Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 sm:h-72 object-cover"
                  />

                  {/* Mock Interactive Post Inside Preview */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/src/assets/images/avatar_shivam_1790446497274.jpg"
                          alt="Shivam Kumar"
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--primary)]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[var(--text)]">Shivam Kumar</span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 fill-sky-500/10" />
                          </div>
                          <span className="text-[11px] text-[var(--muted)]">Java Backend Developer · 2h ago</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-[var(--primary)] bg-[var(--primary-light)] px-2.5 py-0.5 rounded-full">
                        #SpringBoot
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      "Refactored our connection pool in Spring Boot 3.3 today with HikariCP optimizations. p99 dropped from 84ms to 11ms!"
                    </p>

                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-rose-500 font-semibold">
                          <Heart className="h-3.5 w-3.5 fill-rose-500" /> 148
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" /> 23
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3.5 w-3.5" /> 19
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium">98.4% Positive Pulse</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-extrabold text-[var(--primary)] tabular-nums">
                10K+
              </div>
              <div className="text-sm font-semibold text-[var(--text)]">Active Members</div>
              <p className="text-xs text-[var(--muted)]">Engineers, designers, and creators worldwide</p>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-extrabold text-[var(--secondary)] tabular-nums">
                25K+
              </div>
              <div className="text-sm font-semibold text-[var(--text)]">Published Posts</div>
              <p className="text-xs text-[var(--muted)]">Technical deep-dives and creative showcases</p>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-extrabold text-amber-500 tabular-nums">
                5K+
              </div>
              <div className="text-sm font-semibold text-[var(--text)]">Thriving Communities</div>
              <p className="text-xs text-[var(--muted)]">Dedicated groups for niche interests</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Core Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
              Designed for authentic, high-signal connection
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Every detail in Nexora is crafted to reduce cognitive fatigue and elevate genuine conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Smart Feed',
                desc: 'Intelligent, chronological post curation that prioritizes insightful commentary over algorithmic outrage.',
              },
              {
                icon: Users,
                title: 'Communities & Groups',
                desc: 'Create or join focused guilds around Spring Boot, System Design, UI Tokens, or distributed systems.',
              },
              {
                icon: MessageSquare,
                title: 'Instant Messaging',
                desc: 'Low-latency private discussions with typing indicators, attachments, read receipts, and reactions.',
              },
              {
                icon: Compass,
                title: 'Personalized Discovery',
                desc: 'Find peers by mutual connections, geographical proximity, and shared architectural stacks.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure Profiles',
                desc: 'Comprehensive privacy controls: decide who follows, messages, comments, or views your timeline.',
              },
              {
                icon: Bell,
                title: 'Granular Notifications',
                desc: 'Stay informed with unread counters, interactive alerts, and customizable category preferences.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)] mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mb-2">{f.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
              Get started in four simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create your profile', desc: 'Set up your headline, bio, tech stack, and profile photo.' },
              { step: '02', title: 'Connect with people', desc: 'Discover mutual colleagues, engineers, and designers in your field.' },
              { step: '03', title: 'Share content', desc: 'Publish technical posts, architecture breakdowns, photos, and insights.' },
              { step: '04', title: 'Discover communities', desc: 'Join groups, engage in discussions, and save valuable bookmarks.' },
            ].map((s, idx) => (
              <div key={idx} className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/50 p-6 space-y-2">
                <div className="text-2xl font-black text-[var(--primary)] font-mono">
                  {s.step}
                </div>
                <h4 className="text-sm font-bold text-[var(--text)]">{s.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
            Your social world starts here.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Join thousands of professionals sharing what matters on NEXORA. Ready to experience a clean social platform?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('signup')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all"
            >
              <span>Join Nexora Today</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('login')}
              className="w-full sm:w-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-3.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-12 text-xs text-[var(--muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold text-sm">
              N
            </div>
            <span className="font-bold text-sm text-[var(--text)]">NEXORA</span>
            <span className="ml-2">© 2026 NEXORA Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => navigate('about')} className="hover:text-[var(--text)] transition-colors">
              About
            </button>
            <button onClick={() => navigate('contact')} className="hover:text-[var(--text)] transition-colors">
              Contact
            </button>
            <button onClick={() => navigate('faq')} className="hover:text-[var(--text)] transition-colors">
              FAQ
            </button>
            <button onClick={() => navigate('help')} className="hover:text-[var(--text)] transition-colors">
              Knowledge Base
            </button>
            <button onClick={() => navigate('settings')} className="hover:text-[var(--text)] transition-colors">
              Privacy
            </button>
            <button onClick={() => navigate('settings')} className="hover:text-[var(--text)] transition-colors">
              Terms
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
