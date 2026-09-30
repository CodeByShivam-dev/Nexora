-- NEXORA Relational Schema Migration V2
-- Performance Optimization Indexes

-- Users & Profiles
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Posts & Feed Indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON posts(visibility, created_at DESC) WHERE deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_feed_composite ON posts(author_id, visibility, created_at DESC) WHERE deleted = FALSE;

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at ASC) WHERE deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);

-- Likes & Bookmarks
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);

-- Social Graph: Follows, Blocks, Mutes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_receiver ON follow_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_mutes_muter ON mutes(muter_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_created ON notifications(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(receiver_id, is_read) WHERE is_read = FALSE;

-- Messaging
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC);

-- Groups & Pages
CREATE INDEX IF NOT EXISTS idx_groups_owner ON groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_owner ON pages(owner_id);
CREATE INDEX IF NOT EXISTS idx_page_followers_user ON page_followers(user_id);

-- Hashtags & Search
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON hashtags(name);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);

-- Reports & Tokens
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_user_purpose ON otp_verifications(user_id, purpose, expires_at);
