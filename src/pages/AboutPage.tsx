import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Shield, Cpu, Users, Heart, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-12 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-light)] px-3.5 py-1 text-xs font-semibold text-[var(--primary)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          About NEXORA
        </h1>
        <p className="text-xs sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          NEXORA was born from a simple conviction: social platforms should empower humans to think, share, and build together without psychological drag or ad clutter.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)]">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--text)]">Curated Communities</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            High-signal practitioner guilds centered around software engineering, architecture, design systems, and research.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[var(--secondary)]">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--text)]">Modern Architecture</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Engineered with modular TypeScript components, pure CSS tokens, instant micro-interactions, and designed for Spring Boot REST API integration.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--text)]">Privacy by Default</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your data is strictly yours. Granular controls over audience visibility, who can message you, and active session management.
          </p>
        </div>
      </div>

      {/* Product Visual Showcase */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 overflow-hidden shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">Built by Engineers, for Engineers</h2>
            <p className="text-xs text-[var(--muted)]">Experience a clean, distraction-free environment</p>
          </div>
          <button
            onClick={() => navigate('feed')}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-all self-start sm:self-auto"
          >
            <span>Jump to Feed</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <img
          src="/src/assets/images/hero_social_preview_1790446483047.jpg"
          alt="Platform Architecture"
          className="w-full h-72 sm:h-96 object-cover rounded-2xl border border-[var(--border)]"
        />
      </div>
    </div>
  );
};
