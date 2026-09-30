import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  MessageSquare,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';

export const FriendsPage: React.FC = () => {
  const {
    friends,
    toggleFollow,
    acceptFriendRequest,
    rejectFriendRequest,
    navigate,
    openDirectConversation,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const [friendSearch, setFriendSearch] = useState('');

  // Mock pending friend requests
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'req_01',
      name: 'Elena Rostova',
      username: 'elena_arch',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      headline: 'Senior Distributed Systems Architect @ HyperCloud',
      mutualFriends: 11,
    },
    {
      id: 'req_02',
      name: 'Rohan Mehra',
      username: 'rohan_m',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      headline: 'Site Reliability Engineer @ GlobalScale',
      mutualFriends: 6,
    },
  ]);

  const handleAccept = (id: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    acceptFriendRequest(id);
  };

  const handleReject = (id: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    rejectFriendRequest(id);
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
      f.username.toLowerCase().includes(friendSearch.toLowerCase()) ||
      f.headline?.toLowerCase().includes(friendSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[var(--primary)]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
                Network & Connections
              </h1>
              <p className="text-xs text-[var(--muted)]">Manage your professional network and incoming requests</p>
            </div>
          </div>

          {/* Interactive Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'friends'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              My Network ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative ${
                activeTab === 'requests'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1.5 rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'suggestions'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Suggestions
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search connections by name or company..."
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 pl-10 pr-4 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
          />
        </div>
      </div>

      {/* Tab 1: My Friends */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFriends.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={f.avatar}
                  alt={f.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--border)] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--text)] truncate">{f.name}</span>
                    {f.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] truncate">{f.headline}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">
                    {f.mutualFriends || 7} mutual connections
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={async () => {
                    await openDirectConversation(f);
                    navigate('messages');
                  }}
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                  title="Send Message"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleFollow(f.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    f.isFollowing
                      ? 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                      : 'bg-[var(--primary)] text-white hover:opacity-90'
                  }`}
                >
                  {f.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text)]">{req.name}</div>
                    <div className="text-[11px] text-[var(--muted)] truncate">{req.headline}</div>
                    <div className="text-[10px] text-[var(--muted)]">{req.mutualFriends} mutual friends</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="flex items-center gap-1 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-secondary)] transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--muted)]">
              No pending connection requests at the moment.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={f.avatar} alt={f.name} className="h-11 w-11 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[var(--text)] truncate">{f.name}</div>
                  <div className="text-[11px] text-[var(--muted)] truncate">{f.headline}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    {f.distanceKm ? `Approx. ${f.distanceKm} km away` : 'Works in backend systems'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(f.id)}
                className="rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 shrink-0"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
