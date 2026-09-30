import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  Shield,
  MessageSquare,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does NEXORA rank and curate posts in the News Feed?',
      a: 'NEXORA prioritizes chronological updates and quality interaction over algorithmic sensationalism. You see posts from people and communities you explicitly choose to follow, with clean unboxed metadata and zero promotional ads.',
    },
    {
      q: 'Can I connect a real Spring Boot backend to this frontend?',
      a: 'Yes! The entire application has been built with an API-ready architecture inside `src/services/api.ts`. All methods (GET, POST, PUT, DELETE) follow Spring Boot REST API conventions and can be wired to your backend controller endpoints immediately.',
    },
    {
      q: 'How are direct messages and privacy managed on NEXORA?',
      a: 'You have granular control in Settings > Privacy over who can message, follow, or mention you. All message threads simulate real-time typing indicators and status receipts.',
    },
    {
      q: 'How do I create and organize Custom Saved Collections?',
      a: 'Navigate to Bookmarks in the sidebar and click "New Collection". You can tag bookmarks into categories like "Java Resources", "Design Tokens", or "System Design", and choose whether each collection is public or private.',
    },
    {
      q: 'What makes NEXORA different from legacy social networks?',
      a: 'Nexora is built for focused creators, developers, and designers. We follow zero-pill metadata discipline, measured contrast typography, sub-200ms micro-interactions, and local persistence.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setIsSubmitted(true);
    showToast('Your message has been sent to our developer relations team!', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Help Hero & Search */}
      <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-r from-indigo-500/10 via-sky-500/5 to-transparent p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
          Search our knowledge base or explore frequently asked questions about the Nexora platform.
        </p>

        <div className="relative max-w-lg mx-auto mt-2">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Type your question or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 text-xs sm:text-sm text-[var(--text)] shadow-xs focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
      </div>

      {/* Knowledge Base Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Getting Started', desc: 'Account setup & profile tips', icon: Sparkles },
          { title: 'Posts & Feed', desc: 'Composer, media & hashtags', icon: BookOpen },
          { title: 'Communities', desc: 'Guilds, rules & moderation', icon: Users },
          { title: 'Security & Privacy', desc: 'Sessions & visibility switches', icon: Shield },
        ].map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-secondary)] text-[var(--primary)] mb-2 group-hover:scale-105 transition-transform">
                <Icon className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-[var(--text)]">{cat.title}</h4>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">{cat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[var(--text)] tracking-tight">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-[var(--border)]">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[var(--muted)] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--muted)] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-[var(--text-secondary)] leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Us Form (Section 38) */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-[var(--text)] tracking-tight">Contact NEXORA Support</h2>
            <p className="text-xs text-[var(--muted)]">Have questions, feedback, or need technical assistance? Drop us a line.</p>
          </div>

          {isSubmitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-6 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Thank you!</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Your message has been received. Our team will review and reply within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Shivam Kumar"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="shivam@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Feedback on Spring Boot REST integration..."
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry or suggestions..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
