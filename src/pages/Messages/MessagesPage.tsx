import {
  ArrowLeft,
  Info,
  MessageSquare,
  Plus,
  Search,
  Send,
  Smile,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { AppShell } from '../../components/layout/AppShell';
import { useNexora } from '../../context/NexoraContext';
import { formatMessageTime, formatRelativeTime } from '../../utils/formatters';

const CHAT_EMOJIS = ['👋', '🔥', '✨', '🙌', '💡', '🚀', '😄', '❤️'];

export function MessagesPage() {
  const {
    currentUser,
    users,
    conversations,
    messages,
    startOrGetConversation,
    sendMessage,
    deleteMessage,
  } = useNexora();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversationId || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showNewChatPicker, setShowNewChatPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (conversationId) {
      setSelectedConvId(conversationId);
    }
  }, [conversationId]);

  const userConversations = useMemo(() => {
    if (!currentUser) return [];
    const q = searchQuery.trim().toLowerCase();
    return conversations
      .filter((c) => c.participantIds.includes(currentUser.id))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .filter((c) => {
        if (!q) return true;
        const otherId = c.participantIds.find((id) => id !== currentUser.id);
        const other = users.find((u) => u.id === otherId);
        return (
          other?.fullName.toLowerCase().includes(q) ||
          other?.username.toLowerCase().includes(q)
        );
      });
  }, [conversations, currentUser, searchQuery, users]);

  const activeConversation = useMemo(
    () => userConversations.find((c) => c.id === selectedConvId) ?? null,
    [userConversations, selectedConvId]
  );

  const activeOtherUser = useMemo(() => {
    if (!activeConversation || !currentUser) return null;
    const otherId = activeConversation.participantIds.find(
      (id) => id !== currentUser.id
    );
    return users.find((u) => u.id === otherId) ?? null;
  }, [activeConversation, currentUser, users]);

  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages
      .filter((m) => m.conversationId === activeConversation.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [messages, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedConvId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !draft.trim()) return;
    sendMessage(activeConversation.id, draft);
    setDraft('');
    setShowEmojis(false);
  };

  const handleStartChatWith = (userId: string) => {
    const conv = startOrGetConversation(userId);
    if (conv) {
      setSelectedConvId(conv.id);
      navigate(`/messages/${conv.id}`, { replace: true });
    }
    setShowNewChatPicker(false);
  };

  const otherUsers = useMemo(
    () => users.filter((u) => u.id !== currentUser?.id),
    [users, currentUser]
  );

  return (
    <AppShell hideRightSidebar pageTitle="Messages">
      <div className="space-y-4">
        {/* Honest Demo Disclosure */}
        <div className="rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] px-4 py-2.5 flex items-center gap-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
          <Info className="w-4 h-4 text-[#06B6D4] shrink-0" />
          <span>
            Local demo messaging interface. Conversations are stored in your browser and do
            not transmit across external devices.
          </span>
        </div>

        {/* Split Chat Shell */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px] h-[calc(100vh-220px)] max-h-[720px]">
          {/* Conversation List Sidebar */}
          <div
            className={`md:col-span-5 lg:col-span-4 border-r border-slate-200 dark:border-[#252D3A] flex flex-col ${
              selectedConvId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-slate-200 dark:border-[#252D3A] space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Messages
                </h1>
                <button
                  type="button"
                  onClick={() => setShowNewChatPicker((p) => !p)}
                  className="min-w-[36px] min-h-[36px] rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] hover:bg-[#8B5CF6]/25 flex items-center justify-center transition-colors"
                  aria-label="Start new conversation"
                  title="New conversation"
                >
                  {showNewChatPicker ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            {/* New Conversation Picker */}
            {showNewChatPicker && (
              <div className="p-3 border-b border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] space-y-2 max-h-48 overflow-y-auto">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-[#64748B]">
                  Message a creator
                </p>
                {otherUsers.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => handleStartChatWith(person.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-[#141A24] text-left transition-colors"
                  >
                    <Avatar src={person.avatar} name={person.fullName} size="xs" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                        {person.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#64748B] truncate">
                        @{person.username}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Conversation Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#252D3A]">
              {userConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-[#64748B]">
                  No conversations match your filter.
                </div>
              ) : (
                userConversations.map((conv) => {
                  const otherId = conv.participantIds.find(
                    (id) => id !== currentUser?.id
                  );
                  const other = users.find((u) => u.id === otherId);
                  const convMsgs = messages
                    .filter((m) => m.conversationId === conv.id)
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                  const lastMsg = convMsgs[0];
                  const isActive = conv.id === selectedConvId;

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        navigate(`/messages/${conv.id}`, { replace: true });
                      }}
                      className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                        isActive
                          ? 'bg-[#8B5CF6]/10'
                          : 'hover:bg-slate-50 dark:hover:bg-[#1A2230]/50'
                      }`}
                    >
                      <Avatar
                        src={other?.avatar}
                        name={other?.fullName || 'User'}
                        size="md"
                        verified={other?.verified}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                            {other?.fullName || 'Creator'}
                          </p>
                          <span className="text-[11px] text-slate-400 dark:text-[#64748B] shrink-0">
                            {formatRelativeTime(conv.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                          {lastMsg
                            ? `${lastMsg.senderId === currentUser?.id ? 'You: ' : ''}${lastMsg.text}`
                            : 'Start a conversation...'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Pane */}
          <div
            className={`md:col-span-7 lg:col-span-8 flex flex-col h-full min-h-0 ${
              selectedConvId ? 'flex' : 'hidden md:flex'
            }`}
          >
            {activeConversation && activeOtherUser ? (
              <>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-[#252D3A] flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#0E121A]">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedConvId(null);
                        navigate('/messages', { replace: true });
                      }}
                      aria-label="Back to conversations"
                      className="md:hidden min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230]"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${activeOtherUser.username}`)}
                      className="flex items-center gap-2.5 min-w-0 text-left"
                    >
                      <Avatar
                        src={activeOtherUser.avatar}
                        name={activeOtherUser.fullName}
                        size="sm"
                        verified={activeOtherUser.verified}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                          {activeOtherUser.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#64748B] truncate">
                          @{activeOtherUser.username} · Local demo thread
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-[#090B10]/50">
                  {activeMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-slate-500 dark:text-[#64748B]">
                        Say hello to {activeOtherUser.fullName.split(' ')[0]} in this local demo thread.
                      </p>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isOwn = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 group ${
                            isOwn ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {isOwn && (
                            <button
                              type="button"
                              onClick={() => deleteMessage(msg.id)}
                              aria-label="Delete message"
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-slate-400 hover:text-[#EF4444] transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div
                            className={`max-w-[78%] sm:max-w-[68%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              isOwn
                                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-br-sm'
                                : 'border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#1A2230] text-slate-900 dark:text-[#F8FAFC] rounded-bl-sm'
                            }`}
                          >
                            <p className="break-words">{msg.text}</p>
                            <p
                              className={`mt-1 text-[10px] ${
                                isOwn ? 'text-white/80' : 'text-slate-400 dark:text-[#64748B]'
                              }`}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <form
                  onSubmit={handleSend}
                  className="relative p-3.5 border-t border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#141A24] flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojis((s) => !s)}
                    aria-label="Insert emoji"
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1A2230]"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
                  />

                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Send message"
                    className="min-w-[42px] min-h-[42px] rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-95 transition-opacity shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  {showEmojis && (
                    <div className="absolute left-3 bottom-16 z-20 flex items-center gap-1 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-white dark:bg-[#1A2230] p-2 shadow-xl">
                      {CHAT_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setDraft((prev) => prev + emoji)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252D3A] flex items-center justify-center text-base"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  description="Choose an existing thread on the left or start a new local demo chat with any creator."
                  actionLabel="Start New Chat"
                  onAction={() => setShowNewChatPicker(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
