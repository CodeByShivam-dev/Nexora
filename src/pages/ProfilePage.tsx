import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import { PostComposer } from '../components/PostComposer';
import api from '../services/api';
import {
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Edit3,
  MessageSquare,
  Users,
  Image as ImageIcon,
  Video,
  Layers,
  Sparkles,
  Camera,
  UserPlus,
  UserCheck,
  X,
  Save,
  Send,
  Check,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    posts,
    friends,
    groups,
    navigate,
    routeParams,
    updateProfile,
    showToast,
    conversations,
    activeConversationId,
    setActiveConversationId,
    openDirectConversation,
    sendMessage,
    isPartnerTyping,
  } = useApp();

  const targetUsername = (routeParams.username || currentUser.username || '').trim();
  const isMe =
    !routeParams.username ||
    routeParams.username.toLowerCase() === currentUser.username.toLowerCase() ||
    String(routeParams.username) === String(currentUser.id);

  const [profileData, setProfileData] = useState<any>(isMe ? currentUser : null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<'posts' | 'messages' | 'about' | 'friends' | 'photos' | 'videos' | 'groups'>('posts');
  const [profileDmText, setProfileDmText] = useState('');
  const profileMessagesEndRef = useRef<HTMLDivElement>(null);

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editWork, setEditWork] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editInterests, setEditInterests] = useState('');

  // File upload refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Fetch profile
  useEffect(() => {
    let isCancelled = false;
    const fetchProfile = async () => {
      if (!targetUsername) return;
      setIsLoadingProfile(true);
      try {
        const res = await api.getUserProfile(targetUsername);
        if (!isCancelled && res.status === 200 && res.data) {
          setProfileData(res.data);
          if (isMe) {
            setEditName(res.data.name || res.data.displayName || '');
            setEditBio(res.data.bio || '');
            setEditLocation(res.data.location || '');
            setEditWebsite(res.data.website || '');
            setEditWork(res.data.work || '');
            setEditEducation(res.data.education || '');
            setEditInterests(Array.isArray(res.data.interests) ? res.data.interests.join(', ') : '');
          }
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        if (!isCancelled) setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => {
      isCancelled = true;
    };
  }, [targetUsername, isMe]);

  const activeProfile = profileData || (isMe ? currentUser : null);

  // Filter posts authored by this profile
  const userPosts = posts.filter(
    (p) =>
      p.author.username?.toLowerCase() === activeProfile?.username?.toLowerCase() ||
      String(p.author.id) === String(activeProfile?.id)
  );

  // Handle Follow / Unfollow (Sections 7, 8, 9, 10)
  const handleToggleFollow = async () => {
    if (!activeProfile?.id) return;
    const currentlyFollowing = activeProfile.isFollowing;
    try {
      if (!currentlyFollowing) {
        const res = await api.followUser(activeProfile.id);
        if (res.status === 200) {
          setProfileData((prev: any) => ({
            ...prev,
            isFollowing: true,
            followersCount: (prev?.followersCount || 0) + 1,
          }));
          showToast(`You are now following @${activeProfile.username}!`, 'success');
        }
      } else {
        const res = await api.unfollowUser(activeProfile.id);
        if (res.status === 200) {
          setProfileData((prev: any) => ({
            ...prev,
            isFollowing: false,
            followersCount: Math.max(0, (prev?.followersCount || 1) - 1),
          }));
          showToast(`Unfollowed @${activeProfile.username}.`, 'info');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Follow action failed.', 'error');
    }
  };

  // Active conversation for this profile if opened
  const profileConversation = conversations.find(
    (c) =>
      String(c.participant?.id) === String(activeProfile?.id) ||
      (activeProfile?.username && c.participant?.username?.toLowerCase() === activeProfile?.username?.toLowerCase()) ||
      c.id === activeConversationId
  );

  useEffect(() => {
    if (profileTab === 'messages') {
      profileMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [profileTab, profileConversation?.messages, isPartnerTyping]);

  // Handle Message
  const handleDirectMessage = async (openFullPage: boolean = false) => {
    if (!activeProfile?.id) return;
    try {
      await openDirectConversation({
        id: activeProfile.id,
        name: activeProfile.name || activeProfile.displayName || activeProfile.username,
        username: activeProfile.username,
        avatar: activeProfile.avatar,
      });

      if (openFullPage) {
        navigate('messages');
      } else {
        setProfileTab('messages');
        showToast(`Direct message open with @${activeProfile.username}`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Unable to open conversation.', 'error');
    }
  };

  const handleSendProfileDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileDmText.trim()) return;
    sendMessage(profileDmText.trim());
    setProfileDmText('');
  };

  // Handle Avatar Upload (Section 18)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await api.uploadAvatar(file);
      if (res.status === 200 && res.data?.avatarUrl) {
        const newAvatarUrl = res.data.avatarUrl;
        setProfileData((prev: any) => ({ ...prev, avatar: newAvatarUrl }));
        updateProfile({ avatar: newAvatarUrl });
        showToast('Profile photo updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload profile photo.', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Cover Upload (Section 18)
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await api.uploadCover(file);
      if (res.status === 200 && res.data?.coverUrl) {
        const newCoverUrl = res.data.coverUrl;
        setProfileData((prev: any) => ({ ...prev, coverImage: newCoverUrl }));
        updateProfile({ coverImage: newCoverUrl });
        showToast('Cover photo updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload cover photo.', 'error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Save profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields: any = {
      name: editName,
      bio: editBio,
      location: editLocation,
      website: editWebsite,
      work: editWork,
      education: editEducation,
      interests: editInterests ? editInterests.split(',').map((s) => s.trim()) : [],
    };

    updateProfile(updatedFields);
    setProfileData((prev: any) => ({
      ...prev,
      ...updatedFields,
    }));
    setIsEditModalOpen(false);
  };

  const isDemo = ['shivam_dev', 'priya_design', 'alexchen_arch'].includes(activeProfile?.username);

  const photoGallery = [
    { url: '/src/assets/images/post_photo_tech_1790446531677.jpg', caption: 'Clean development desk setup' },
    { url: '/src/assets/images/hero_social_preview_1790446483047.jpg', caption: 'Nexora engineering roadmap' },
    { url: '/src/assets/images/group_banner_dev_1790446548511.jpg', caption: 'Bengaluru Tech Park coworking' },
  ];

  if (!activeProfile && isLoadingProfile) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--muted)] space-y-3">
        <div className="h-8 w-8 mx-auto border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--muted)] space-y-3">
        <h3 className="text-sm font-bold text-[var(--text)]">User Not Found</h3>
        <p>Could not locate user "@{targetUsername}".</p>
        <button
          onClick={() => navigate('search')}
          className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file inputs for avatar/cover upload */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header Container */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-indigo-900 via-slate-800 to-indigo-950 overflow-hidden group">
          {activeProfile.coverImage ? (
            <img
              src={activeProfile.coverImage}
              alt="Profile Cover"
              className="h-full w-full object-cover opacity-75"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-indigo-900 via-slate-800 to-indigo-950" />
          )}

          {isMe && (
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{isUploadingCover ? 'Uploading...' : 'Change Cover'}</span>
            </button>
          )}
        </div>

        {/* Profile Info Row */}
        <div className="relative px-6 pb-6 pt-0 sm:pt-2">
          {/* Avatar floating over cover */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="relative group">
              <img
                src={
                  activeProfile.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                }
                alt={activeProfile.name || activeProfile.username}
                referrerPolicy="no-referrer"
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover ring-4 ring-[var(--surface)] shadow-md bg-[var(--surface-secondary)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                }}
              />
              {isMe && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Upload new avatar"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px] font-semibold mt-1">
                    {isUploadingAvatar ? 'Saving...' : 'Upload'}
                  </span>
                </button>
              )}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2">
              {isMe ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-all shadow-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => navigate('settings')}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-all shadow-xs"
                  >
                    <span>Settings</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleToggleFollow}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-xs ${
                      activeProfile.isFollowing
                        ? 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                        : 'bg-[var(--primary)] text-white hover:opacity-95'
                    }`}
                  >
                    {activeProfile.isFollowing ? (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDirectMessage(false)}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:opacity-95 transition-all shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Direct Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                  {activeProfile.name || activeProfile.displayName || activeProfile.username}
                </h1>
                {activeProfile.isVerified && (
                  <CheckCircle2 className="h-5 w-5 text-sky-500 fill-sky-500/10" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs text-[var(--muted)] font-mono">@{activeProfile.username}</p>
              </div>
            </div>

            {activeProfile.bio ? (
              <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed max-w-2xl">
                {activeProfile.bio}
              </p>
            ) : (
              <p className="text-xs text-[var(--muted)] italic">
                No bio added yet
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)] pt-1">
              {activeProfile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span>{activeProfile.location}</span>
                </div>
              )}
              {activeProfile.website && (
                <a
                  href={activeProfile.website.startsWith('http') ? activeProfile.website : `https://${activeProfile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-sky-500" />
                  <span>{activeProfile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {activeProfile.joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Joined {new Date(activeProfile.joinedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Real Stats Row (Sections 6, 8, 9) */}
            <div className="flex items-center gap-6 pt-3 border-t border-[var(--border)] text-xs">
              <div className="flex items-center gap-1.5">
                <strong className="text-sm font-bold text-[var(--text)] tabular-nums">
                  {activeProfile.postsCount ?? userPosts.length}
                </strong>
                <span className="text-[var(--muted)]">Posts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <strong className="text-sm font-bold text-[var(--text)] tabular-nums">
                  {Number(activeProfile.followersCount || 0).toLocaleString()}
                </strong>
                <span className="text-[var(--muted)]">Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <strong className="text-sm font-bold text-[var(--text)] tabular-nums">
                  {Number(activeProfile.followingCount || 0).toLocaleString()}
                </strong>
                <span className="text-[var(--muted)]">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex overflow-x-auto border-t border-[var(--border)] bg-[var(--surface-secondary)]/50 px-4">
          {[
            { id: 'posts', label: `Posts (${userPosts.length})` },
            ...(!isMe ? [{ id: 'messages', label: 'Direct Message' }] : []),
            { id: 'about', label: 'About' },
            { id: 'friends', label: 'Friends' },
            { id: 'photos', label: 'Photos' },
            { id: 'videos', label: 'Videos' },
            { id: 'groups', label: 'Groups' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'messages') {
                  handleDirectMessage(false);
                } else {
                  setProfileTab(tab.id as any);
                }
              }}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                profileTab === tab.id
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--surface)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Direct Message (when viewing another user) */}
      {!isMe && profileTab === 'messages' && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[var(--surface-secondary)]/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    activeProfile.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                  }
                  alt={activeProfile.name || activeProfile.username}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--border)]"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    {activeProfile.name || activeProfile.displayName || activeProfile.username}
                  </h3>
                  {activeProfile.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-sky-500 fill-sky-500/10" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <span>@{activeProfile.username}</span>
                  <span>·</span>
                  <span className="text-emerald-500 font-medium">Active now</span>
                  <span>·</span>
                  <span>End-to-End Direct Message</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDirectMessage(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-all shadow-xs"
              title="Open full conversation in Messages page"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[var(--muted)]" />
              <span className="hidden sm:inline">Open in Messages View</span>
            </button>
          </div>

          {/* Message List */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[var(--bg-secondary)]/40">
            {profileConversation?.messages && profileConversation.messages.length > 0 ? (
              profileConversation.messages.map((msg) => {
                const isSentByMe = String(msg.senderId) === String(currentUser.id);
                const senderDisplayName =
                  msg.senderDisplayName ||
                  msg.sender?.name ||
                  (isSentByMe ? (currentUser.name || currentUser.username) : (activeProfile.name || activeProfile.displayName || activeProfile.username));
                const senderUsername =
                  msg.senderUsername ||
                  msg.sender?.username ||
                  (isSentByMe ? currentUser.username : activeProfile.username);
                const senderAvatar =
                  msg.senderAvatarUrl ||
                  msg.sender?.avatar ||
                  (isSentByMe ? currentUser.avatar : activeProfile.avatar);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isSentByMe && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-[var(--text)]">
                          {senderDisplayName}
                        </span>
                        {senderUsername && (
                          <span className="text-[10px] text-[var(--muted)]">
                            @{senderUsername}
                          </span>
                        )}
                      </div>
                    )}

                    <div className={`flex items-end gap-2 max-w-[85%] ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                      {!isSentByMe && (
                        <img
                          src={senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={senderDisplayName}
                          className="h-6 w-6 rounded-full object-cover ring-1 ring-[var(--border)] shrink-0 mb-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                          }}
                        />
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isSentByMe
                            ? 'bg-[var(--primary)] text-white rounded-br-xs'
                            : 'bg-[var(--surface-secondary)] text-[var(--text)] border border-[var(--border)] rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>

                    <div className={`flex items-center gap-1 text-[10px] text-[var(--muted)] mt-1 px-1 ${isSentByMe ? 'pr-1' : 'pl-8'}`}>
                      <span className="tabular-nums">{msg.timestamp}</span>
                      {isSentByMe && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="h-3 w-3 text-sky-400" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--muted)] space-y-2">
                <div className="h-10 w-10 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="font-semibold text-[var(--text)]">Private Direct Message</p>
                <p className="max-w-xs text-[var(--muted)]">
                  Messages with @{activeProfile.username} are private, secure, and encrypted.
                </p>
              </div>
            )}

            {isPartnerTyping && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] italic pt-1">
                <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <span>@{activeProfile.username} is typing...</span>
              </div>
            )}
            <div ref={profileMessagesEndRef} />
          </div>

          {/* DM Input Bar */}
          <form
            onSubmit={handleSendProfileDm}
            className="p-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Message @${activeProfile.username}...`}
              value={profileDmText}
              onChange={(e) => setProfileDmText(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] py-2.5 px-3.5 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!profileDmText.trim()}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
              aria-label="Send direct message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 1: Posts */}
      {profileTab === 'posts' && (
        <div className="space-y-4">
          {isMe && <PostComposer />}
          {userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--muted)]">
              {isMe
                ? 'No posts published yet. Share your first thought!'
                : `@${activeProfile.username} has not posted yet.`}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: About */}
      {profileTab === 'about' && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
              Biography
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
              {activeProfile.bio || 'No biography provided.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-[var(--primary)]" /> Current Work
              </span>
              <p className="text-xs text-[var(--text)] font-medium">
                {activeProfile.work || 'Not specified'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-[var(--secondary)]" /> Education
              </span>
              <p className="text-xs text-[var(--text)] font-medium">
                {activeProfile.education || 'Not specified'}
              </p>
            </div>
          </div>

          {activeProfile.interests && activeProfile.interests.length > 0 && (
            <div className="border-t border-[var(--border)] pt-4">
              <h3 className="text-xs font-semibold text-[var(--muted)] mb-3">Technical Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {activeProfile.interests.map((int: string) => (
                  <span
                    key={int}
                    className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)] font-medium"
                  >
                    {int}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Friends */}
      {profileTab === 'friends' && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text)]">Connections</h3>
            <span className="text-xs text-[var(--muted)]">{friends.length} connections</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text)] truncate">{friend.name}</div>
                    <div className="text-[11px] text-[var(--muted)] truncate">{friend.headline}</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('profile', { username: friend.username })}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] transition-all shrink-0"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Photos */}
      {profileTab === 'photos' && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
            <ImageIcon className="h-4 w-4 text-[var(--primary)]" />
            <span>Shared Photography</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {photoGallery.map((photo, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-[var(--border)] aspect-4/3">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end">
                  <span className="text-xs text-white font-medium">{photo.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Videos */}
      {profileTab === 'videos' && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--muted)] space-y-2">
          <Video className="mx-auto h-8 w-8 text-[var(--muted)]" />
          <p>No video uploads yet. Record tech walkthroughs or share presentation recordings.</p>
        </div>
      )}

      {/* Tab 6: Groups */}
      {profileTab === 'groups' && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Joined Communities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.filter((g) => g.isJoined).map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]/50">
                <img src={g.avatar} alt={g.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[var(--text)] truncate">{g.name}</div>
                  <div className="text-[11px] text-[var(--muted)]">{(g.membersCount / 1000).toFixed(1)}k members</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-base font-bold text-[var(--text)]">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Biography</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:outline-none resize-none"
                  placeholder="Share a short bio with the community..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Website</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Work / Role</label>
                  <input
                    type="text"
                    value={editWork}
                    onChange={(e) => setEditWork(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="Software Engineer @ ..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)]">Education</label>
                  <input
                    type="text"
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="University / Degree"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)]">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={editInterests}
                  onChange={(e) => setEditInterests(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Design, React, Photography, Architecture"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-95 shadow-xs cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
