import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { normalizeMessage } from '../types';
import api from '../services/api';
import {
  Search,
  Send,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Info,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    isPartnerTyping,
    currentUser,
    showToast,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(activeConversationId));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    if (activeConversationId) {
      setMobileShowChat(true);
    }
  }, [activeConversationId]);

  // Sync real messages from DB if it's a real database conversation
  useEffect(() => {
    if (activeConv && !activeConv.id.startsWith('conv_')) {
      api.getMessages(activeConv.id).then((res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          const loadedMessages = res.data;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConv.id) {
                return {
                  ...c,
                  messages: loadedMessages.map((m: any) => normalizeMessage(m, activeConv.id)),
                };
              }
              return c;
            })
          );
        }
      }).catch(console.error);
    }
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isPartnerTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        sendMessage('', dataUrl);
        showToast('Photo sent in conversation!', 'success');
      }
    };

    try {
      const res = await api.uploadFile(file);
      if (res.status === 200 && res.data?.mediaUrl) {
        sendMessage('', res.data.mediaUrl);
        showToast('Photo sent in conversation!', 'success');
      } else {
        reader.readAsDataURL(file);
      }
    } catch (_) {
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingFile(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const emojis = ['👍', '🚀', '🔥', '☕', '💡', '🎉', '👏', '❤️', '💻', '✨'];

  const filteredConversations = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[500px] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xs flex">
      {/* Left Conversations Sidebar */}
      <div className={`${mobileShowChat ? 'hidden' : 'flex'} sm:flex w-full sm:w-80 md:w-96 border-r border-[var(--border)] flex-col shrink-0 bg-[var(--surface)]`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text)] tracking-tight">Messages</h2>
            <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2 pl-9 pr-3 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConv?.id;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setMobileShowChat(true);
                }}
                className={`flex w-full items-start gap-3 p-3.5 text-left transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-light)]'
                    : 'hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.participant.avatar}
                    alt={conv.participant.name}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--border)]"
                  />
                  {conv.participant.isOnline ? (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
                  ) : (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-slate-400 ring-2 ring-[var(--surface)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-bold text-[var(--text)]">
                      {conv.participant.name}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] tabular-nums shrink-0 ml-1">
                      {conv.timestamp}
                    </span>
                  </div>

                  <p className="truncate text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white tabular-nums shrink-0 mt-1">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      {activeConv ? (
        <div className={`${mobileShowChat ? 'flex' : 'hidden'} sm:flex flex-1 flex-col h-full bg-[var(--surface)]`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 sm:px-5 py-3.5 bg-[var(--surface)] shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMobileShowChat(false)}
                className="sm:hidden p-1.5 -ml-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative">
                <img
                  src={activeConv.participant.avatar}
                  alt={activeConv.participant.name}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--border)]"
                />
                {activeConv.participant.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{activeConv.participant.name}</h3>
                <span className="text-[11px] text-[var(--muted)]">
                  {activeConv.participant.isOnline ? 'Online now' : activeConv.participant.lastSeen || 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[var(--muted)]">
              <button
                onClick={() => showToast('Audio call simulation ready', 'info')}
                className="p-2 rounded-lg hover:text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                title="Voice Call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => showToast('Video call simulation ready', 'info')}
                className="p-2 rounded-lg hover:text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                title="Video Call"
              >
                <Video className="h-4 w-4" />
              </button>
              <button
                onClick={() => showToast('Conversation details', 'info')}
                className="p-2 rounded-lg hover:text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                title="Details"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[var(--background)]/30">
            {/* Date separator */}
            <div className="flex items-center justify-center my-3">
              <span className="bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full text-[10px] font-semibold text-[var(--muted)] shadow-xs">
                Today
              </span>
            </div>

            {activeConv.messages.map((msg) => {
              const isOwnMessage = String(msg.senderId) === String(currentUser.id);
              const senderDisplayName =
                msg.senderDisplayName ||
                msg.sender?.name ||
                (isOwnMessage ? (currentUser.name || currentUser.username) : activeConv.participant.name);
              const senderUsername =
                msg.senderUsername ||
                msg.sender?.username ||
                (isOwnMessage ? currentUser.username : activeConv.participant.username);
              const senderAvatar =
                msg.senderAvatarUrl ||
                msg.sender?.avatar ||
                (isOwnMessage ? currentUser.avatar : activeConv.participant.avatar);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Header for other user */}
                  {!isOwnMessage && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-semibold text-[var(--text)]">
                        {senderDisplayName}
                      </span>
                      {senderUsername && (
                        <span className="text-[10px] text-[var(--muted)]">
                          @{senderUsername}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-md ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isOwnMessage && (
                      <img
                        src={senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={senderDisplayName}
                        className="h-7 w-7 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0 mb-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                        }}
                      />
                    )}

                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isOwnMessage
                          ? 'bg-[var(--primary)] text-white rounded-br-xs'
                          : 'bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text)] rounded-bl-xs'
                      }`}
                    >
                      {/* Media Image Attachment if available */}
                      {(msg.mediaUrl || msg.text?.startsWith('[Photo Attachment]:')) && (
                        <div className="mb-1.5 overflow-hidden rounded-xl max-w-xs">
                          <img
                            src={msg.mediaUrl || msg.text.replace('[Photo Attachment]:', '').trim()}
                            alt="Attachment"
                            className="max-h-56 w-auto rounded-lg object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (!img.dataset.hasFailed) {
                                img.dataset.hasFailed = 'true';
                                img.src = '/src/assets/images/post_photo_tech_1790446531677.jpg';
                              }
                            }}
                          />
                        </div>
                      )}
                      {msg.text && !msg.text.startsWith('[Photo Attachment]:') && (
                        <div>{msg.text}</div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 mt-1 text-[10px] text-[var(--muted)] px-1 ${isOwnMessage ? 'pr-1' : 'pl-9'}`}>
                    <span className="tabular-nums">{msg.timestamp}</span>
                    {isOwnMessage && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="h-3 w-3 text-sky-400" />
                        ) : (
                          <Check className="h-3 w-3 text-[var(--muted)]" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isPartnerTyping && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] animate-pulse pl-1">
                <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] px-3 py-2 rounded-2xl rounded-bl-xs shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[11px]">{activeConv.participant.name.split(' ')[0]} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emoji Bar */}
          {showEmojiPicker && (
            <div className="border-t border-[var(--border)] bg-[var(--surface)] p-2 flex items-center gap-2 overflow-x-auto">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="h-8 w-8 text-base flex items-center justify-center rounded-lg hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Chat Composer */}
          <input
            type="file"
            ref={attachmentInputRef}
            onChange={handleAttachmentUpload}
            accept="image/*"
            className="hidden"
          />
          <form onSubmit={handleSend} className="p-3.5 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-[var(--muted)] hover:text-amber-500 rounded-lg hover:bg-[var(--surface-secondary)] transition-colors"
            >
              <Smile className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              disabled={isUploadingFile}
              className="p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface-secondary)] transition-colors"
              title="Upload photo or file attachment"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConv.participant.name}...`}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-2.5 text-xs sm:text-sm text-[var(--text)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-xs hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center text-xs text-[var(--muted)]">
          Select a conversation from the sidebar to start messaging.
        </div>
      )}
    </div>
  );
};
