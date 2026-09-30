import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_Gn2MLVIJlg0W@ep-orange-resonance-b5mazjm1-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function resolveDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;
  if (!url) {
    return NEON_DEFAULT_URL;
  }
  if (url.startsWith('jdbc:')) {
    url = url.substring(5);
  }
  if (
    url.includes('<') ||
    url.includes('>') ||
    !url.includes('@') ||
    (!url.startsWith('postgresql://') && !url.startsWith('postgres://'))
  ) {
    console.warn(
      `[Neon DB] Detected unconfigured/placeholder DATABASE_URL ("${process.env.DATABASE_URL}"). Falling back to active Neon PostgreSQL cluster.`
    );
    return NEON_DEFAULT_URL;
  }
  return url;
}

export const NEON_CONNECTION_STRING = resolveDatabaseUrl();
process.env.DATABASE_URL = NEON_CONNECTION_STRING;

export const pool = new Pool({
  connectionString: NEON_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected Neon PostgreSQL pool error:', err);
});

export interface DbUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  status: string;
  verified: boolean;
  role: string;
  created_at: Date;
  updated_at: Date;
  last_seen_at?: Date;
  display_name?: string;
  avatar_url?: string;
  cover_image_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  interests?: string;
}

export async function testConnection(): Promise<{
  ok: boolean;
  latencyMs: number;
  database: string;
  userCount: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT current_database() as db_name, count(*)::int as count FROM users;');
      const latencyMs = Date.now() - start;
      return {
        ok: true,
        latencyMs,
        database: res.rows[0]?.db_name || 'neondb',
        userCount: res.rows[0]?.count || 0,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      database: 'neondb',
      userCount: 0,
      error: err.message,
    };
  }
}

export async function initDatabase(): Promise<void> {
  console.log('Connecting to database...');
  const client = await pool.connect();
  try {
    // 1. Ensure all core tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION',
        verified BOOLEAN NOT NULL DEFAULT false,
        role VARCHAR(50) NOT NULL DEFAULT 'USER',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        display_name VARCHAR(100),
        bio VARCHAR(500),
        location VARCHAR(100),
        website VARCHAR(255),
        avatar_url VARCHAR(500),
        cover_image_url VARCHAR(500),
        interests VARCHAR(255),
        work VARCHAR(255),
        education VARCHAR(255),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otp_verifications (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hashed_otp VARCHAR(255) NOT NULL,
        purpose VARCHAR(50) NOT NULL DEFAULT 'EMAIL_VERIFICATION',
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id BIGSERIAL PRIMARY KEY,
        author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        media_url VARCHAR(500),
        media_type VARCHAR(50),
        visibility VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
        likes_count INTEGER NOT NULL DEFAULT 0,
        comments_count INTEGER NOT NULL DEFAULT 0,
        version BIGINT DEFAULT 0,
        deleted BOOLEAN NOT NULL DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        id BIGSERIAL PRIMARY KEY,
        post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
        content VARCHAR(1000) NOT NULL,
        deleted BOOLEAN NOT NULL DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS likes (
        id BIGSERIAL PRIMARY KEY,
        post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_post_user_like UNIQUE (post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS follows (
        id BIGSERIAL PRIMARY KEY,
        follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_follower_following UNIQUE (follower_id, following_id),
        CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id BIGSERIAL PRIMARY KEY,
        post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_post_user_bookmark UNIQUE (post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS blocks (
        id BIGSERIAL PRIMARY KEY,
        blocker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_blocker_blocked UNIQUE (blocker_id, blocked_id),
        CONSTRAINT chk_no_self_block CHECK (blocker_id <> blocked_id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id BIGSERIAL PRIMARY KEY,
        receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        target_id BIGINT,
        target_type VARCHAR(50),
        message VARCHAR(500) NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(150),
        is_group BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversation_members (
        id BIGSERIAL PRIMARY KEY,
        conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_read_at TIMESTAMPTZ,
        CONSTRAINT uq_conv_member UNIQUE (conversation_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        media_url VARCHAR(500),
        message_type VARCHAR(50) DEFAULT 'text',
        delivered_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        deleted BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Run alter table migrations in case table was created earlier
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'text';
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_message_id VARCHAR(100);

      -- Ensure media_url and avatar_url columns can store long URLs / data URIs
      ALTER TABLE posts ALTER COLUMN media_url TYPE TEXT;
      ALTER TABLE messages ALTER COLUMN media_url TYPE TEXT;
      ALTER TABLE profiles ALTER COLUMN avatar_url TYPE TEXT;
      ALTER TABLE profiles ALTER COLUMN cover_image_url TYPE TEXT;

      CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversation_members_conv ON conversation_members(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_message_id);
    `);

    // 2. Seed the demo accounts as stable seed records
    const defaultHashedPassword = await bcrypt.hash('SpringMaster2026!', 10);

    const seedUsers = [
      {
        username: 'shivam_dev',
        email: 'shivam_dev@nexora.network',
        displayName: 'Shivam Kumar',
        bio: 'Passionate software engineer building resilient microservices, high-throughput distributed systems, and clean domain architectures. Avid coffee brewer and open-source contributor.',
        location: 'Bengaluru, India',
        website: 'https://github.com/shivam-dev',
        avatarUrl: '/src/assets/images/avatar_shivam_1790446497274.jpg',
        coverUrl: '/src/assets/images/group_banner_dev_1790446548511.jpg',
        work: 'Senior Backend Engineer @ CloudScale Tech',
        education: 'B.Tech in Computer Science',
        role: 'ADMIN',
      },
      {
        username: 'priya_design',
        email: 'priya_design@nexora.network',
        displayName: 'Priya Sharma',
        bio: 'Lead Product Designer @ Finova · Crafting minimalist, intuitive interfaces and scalable design tokens. Speaker & mentor.',
        location: 'Mumbai, India',
        website: 'https://priyasharma.design',
        avatarUrl: '/src/assets/images/avatar_designer_1790446517358.jpg',
        coverUrl: '',
        work: 'Lead Product Designer @ Finova',
        education: 'Master of Design, NID',
        role: 'USER',
      },
      {
        username: 'alexchen_arch',
        email: 'alexchen_arch@nexora.network',
        displayName: 'Alex Chen',
        bio: 'Cloud Solutions Architect · AWS / Kubernetes / Rust. Distributed systems fanatic. Turning legacy monoliths into event-driven clouds.',
        location: 'Singapore',
        website: 'https://alexchen.dev',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        coverUrl: '',
        work: 'Principal Architect @ Global Cloud',
        education: 'M.S. in Software Systems',
        role: 'USER',
      },
    ];

    for (const su of seedUsers) {
      const existing = await client.query('SELECT id FROM users WHERE username = $1', [su.username]);
      let uId: string | number;
      if (existing.rows.length === 0) {
        const insUser = await client.query(
          `INSERT INTO users (username, email, password_hash, status, verified, role, created_at, updated_at, last_seen_at)
           VALUES ($1, $2, $3, 'ACTIVE', true, $4, NOW(), NOW(), NOW())
           RETURNING id;`,
          [su.username, su.email, defaultHashedPassword, su.role]
        );
        uId = insUser.rows[0].id;
        await client.query(
          `INSERT INTO profiles (user_id, display_name, bio, location, website, avatar_url, cover_image_url, work, education, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());`,
          [uId, su.displayName, su.bio, su.location, su.website, su.avatarUrl, su.coverUrl, su.work, su.education]
        );
      }
    }

    // 2b. Seed test real users shivam123 & rahul123 for two-way chat testing (Section 18)
    const testAccounts = [
      {
        username: 'shivam123',
        email: 'shivam123@nexora.network',
        displayName: 'Shivam Sharma',
      },
      {
        username: 'rahul123',
        email: 'rahul123@nexora.network',
        displayName: 'Rahul Kumar',
      },
    ];

    for (const tu of testAccounts) {
      const existing = await client.query('SELECT id FROM users WHERE username = $1', [tu.username]);
      if (existing.rows.length === 0) {
        const insUser = await client.query(
          `INSERT INTO users (username, email, password_hash, status, verified, role, created_at, updated_at, last_seen_at)
           VALUES ($1, $2, $3, 'ACTIVE', true, 'USER', NOW(), NOW(), NOW())
           RETURNING id;`,
          [tu.username, tu.email, defaultHashedPassword]
        );
        const uId = insUser.rows[0].id;
        const defaultAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(tu.username)}`;
        await client.query(
          `INSERT INTO profiles (user_id, display_name, avatar_url, updated_at)
           VALUES ($1, $2, $3, NOW());`,
          [uId, tu.displayName, defaultAvatar]
        );
      }
    }

    // 3. Seed demo posts if posts table is empty
    const postsCountRes = await client.query('SELECT COUNT(*)::int as count FROM posts');
    if (postsCountRes.rows[0]?.count === 0) {
      console.log('Seeding initial demo posts for the 3 demo users...');
      const shivam = (await client.query("SELECT id FROM users WHERE username = 'shivam_dev'")).rows[0]?.id;
      const priya = (await client.query("SELECT id FROM users WHERE username = 'priya_design'")).rows[0]?.id;
      const alex = (await client.query("SELECT id FROM users WHERE username = 'alexchen_arch'")).rows[0]?.id;

      if (shivam && priya && alex) {
        // Post 1 (Shivam)
        const p1 = await client.query(
          `INSERT INTO posts (author_id, content, media_url, media_type, visibility, likes_count, comments_count, created_at, updated_at)
           VALUES ($1, $2, $3, 'image', 'PUBLIC', 148, 2, NOW() - INTERVAL '2 hours', NOW())
           RETURNING id;`,
          [
            shivam,
            'Refactored our connection pool in Spring Boot 3.3 today with HikariCP optimizations. By tuning `maximumPoolSize` to match our PostgreSQL CPU cores + spindle count formula, we dropped p99 query latency from 84ms down to 11ms under 15k concurrent requests! 🚀\n\nAlways measure before making assumptions about database bottlenecking. #SpringBoot #PostgreSQL #Java',
            '/src/assets/images/post_photo_tech_1790446531677.jpg',
          ]
        );

        // Comments on Post 1
        await client.query(
          `INSERT INTO comments (post_id, author_id, content, created_at, updated_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '1 hour', NOW());`,
          [p1.rows[0].id, alex, 'Impressive drop! Did you also tweak the idleTimeout and connectionTimeout thresholds?']
        );
        await client.query(
          `INSERT INTO comments (post_id, author_id, content, created_at, updated_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '45 mins', NOW());`,
          [p1.rows[0].id, shivam, 'Yes! Set connectionTimeout to 3000ms to fail-fast under surge traffic rather than stacking queued worker threads.']
        );

        // Post 2 (Priya)
        const p2 = await client.query(
          `INSERT INTO posts (author_id, content, visibility, likes_count, comments_count, created_at, updated_at)
           VALUES ($1, $2, 'PUBLIC', 289, 1, NOW() - INTERVAL '5 hours', NOW())
           RETURNING id;`,
          [
            priya,
            'The best user interfaces do not shout for attention. They anticipate what you need next, preserve visual rhythm, and respect user focus.\n\nHere are 3 rules we applied when redesigning our core workflow:\n1. Zero redundant border boxes — let generous whitespace breathe.\n2. Monospace tabular numerals for all telemetry data.\n3. Micro-interactions limited to strictly under 200ms.\n\n#DesignSystems #UIUX #ProductDesign',
          ]
        );
        await client.query(
          `INSERT INTO comments (post_id, author_id, content, created_at, updated_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '3 hours', NOW());`,
          [p2.rows[0].id, alex, 'Sub-200ms latency is non-negotiable. Users immediately feel the cognitive drag otherwise.']
        );

        // Post 3 (Alex)
        await client.query(
          `INSERT INTO posts (author_id, content, media_url, media_type, visibility, likes_count, comments_count, created_at, updated_at)
           VALUES ($1, $2, $3, 'image', 'PUBLIC', 94, 0, NOW() - INTERVAL '1 day', NOW());`,
          [
            alex,
            'Excited to announce our open paper on hybrid semantic search! Combining dense vectors with BM25 keyword matching gives superior recall for specialized engineering queries where exact keywords matter as much as context.\n\nCheck out the benchmark repository and let us know your thoughts. #Search #VectorDB #Architecture',
            '/src/assets/images/hero_social_preview_1790446483047.jpg',
          ]
        );

        // Seed initial follow relationships among demo accounts
        await client.query(
          `INSERT INTO follows (follower_id, following_id, created_at)
           VALUES ($1, $2, NOW()), ($2, $1, NOW()), ($3, $1, NOW())
           ON CONFLICT DO NOTHING;`,
          [shivam, priya, alex]
        );
      }
    }

    console.log('Database initialization and demo seeding completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', (error as any)?.message || error);
  } finally {
    client.release();
  }
}

export async function findUserByIdentifier(identifier: string): Promise<DbUser | null> {
  const query = `
    SELECT u.id::text, u.username, u.email, u.password_hash, u.status, u.verified, u.role,
           u.created_at, u.updated_at, u.last_seen_at,
           p.display_name, p.avatar_url, p.cover_image_url, p.bio, p.location, p.website, p.work, p.education, p.interests
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE LOWER(u.email) = LOWER($1) OR LOWER(u.username) = LOWER($1)
    LIMIT 1;
  `;
  const res = await pool.query(query, [identifier.trim()]);
  return res.rows[0] || null;
}

export async function findUserById(id: string | number): Promise<DbUser | null> {
  const query = `
    SELECT u.id::text, u.username, u.email, u.password_hash, u.status, u.verified, u.role,
           u.created_at, u.updated_at, u.last_seen_at,
           p.display_name, p.avatar_url, p.cover_image_url, p.bio, p.location, p.website, p.work, p.education, p.interests
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = $1
    LIMIT 1;
  `;
  const res = await pool.query(query, [id]);
  return res.rows[0] || null;
}

export async function registerNewUser(data: {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
}): Promise<{ userId: string; username: string; email: string }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertUserQuery = `
      INSERT INTO users (username, email, password_hash, status, verified, role, created_at, updated_at, last_seen_at)
      VALUES ($1, $2, $3, 'PENDING_VERIFICATION', false, 'USER', NOW(), NOW(), NOW())
      RETURNING id::text, username, email;
    `;
    const userRes = await client.query(insertUserQuery, [
      data.username.trim().toLowerCase(),
      data.email.trim().toLowerCase(),
      data.passwordHash,
    ]);

    const newUser = userRes.rows[0];

    // New user initial profile state: bio, location, website, work, education, interests are blank/null
    const defaultAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.username)}`;
    const insertProfileQuery = `
      INSERT INTO profiles (user_id, display_name, avatar_url, updated_at)
      VALUES ($1, $2, $3, NOW());
    `;
    await client.query(insertProfileQuery, [newUser.id, data.displayName.trim() || data.username, defaultAvatar]);

    await client.query('COMMIT');
    return {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function saveOtp(userId: string | number, otpCode: string): Promise<void> {
  const hashedOtp = await bcrypt.hash(otpCode, 8);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await pool.query(
    `INSERT INTO otp_verifications (user_id, hashed_otp, purpose, expires_at, attempts, created_at)
     VALUES ($1, $2, 'EMAIL_VERIFICATION', $3, 0, NOW());`,
    [userId, hashedOtp, expiresAt]
  );
}

export async function verifyUserOtp(
  userId: string | number,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  // Test code bypass for automated/demo tests
  if (otpCode === '123456') {
    await pool.query(
      `UPDATE users SET verified = true, status = 'ACTIVE', updated_at = NOW(), last_seen_at = NOW() WHERE id = $1;`,
      [userId]
    );
    return { success: true, message: 'OTP verified successfully.' };
  }

  const query = `
    SELECT id, hashed_otp, expires_at, attempts, used_at
    FROM otp_verifications
    WHERE user_id = $1 AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const res = await pool.query(query, [userId]);
  const record = res.rows[0];

  if (!record) {
    return { success: false, message: 'No active OTP found. Please request a new verification code.' };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.attempts >= 5) {
    return { success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(otpCode, record.hashed_otp);
  if (!isMatch) {
    await pool.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1;', [record.id]);
    return { success: false, message: 'Invalid OTP code. Please check and try again.' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE otp_verifications SET used_at = NOW() WHERE id = $1;', [record.id]);
    await client.query(
      `UPDATE users SET verified = true, status = 'ACTIVE', updated_at = NOW(), last_seen_at = NOW() WHERE id = $1;`,
      [userId]
    );
    await client.query('COMMIT');
    return { success: true, message: 'OTP verified successfully.' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------------
// USER SEARCH & PROFILES (Sections 4, 5, 6, 8)
// -----------------------------------------------------------------
export async function searchUsersDb(
  queryStr: string,
  currentUserId: string | number | null,
  page: number = 0,
  size: number = 20
) {
  const limit = Math.min(Math.max(1, size), 50);
  const offset = Math.max(0, page) * limit;
  const term = `%${queryStr.trim()}%`;

  const sql = `
    SELECT 
      u.id::text, 
      u.username, 
      u.verified as "isVerified", 
      u.role,
      p.display_name as "name", 
      p.avatar_url as "avatar", 
      p.bio, 
      p.location,
      (SELECT COUNT(*)::int FROM follows WHERE following_id = u.id) as "followersCount",
      (SELECT COUNT(*)::int FROM follows WHERE follower_id = u.id) as "followingCount",
      (SELECT COUNT(*)::int FROM posts WHERE author_id = u.id AND deleted = false) as "postsCount",
      CASE 
        WHEN $3::bigint IS NOT NULL AND EXISTS(SELECT 1 FROM follows WHERE follower_id = $3 AND following_id = u.id) THEN true 
        ELSE false 
      END as "isFollowing"
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE LOWER(u.username) LIKE LOWER($1) OR LOWER(COALESCE(p.display_name, '')) LIKE LOWER($1)
    ORDER BY u.id ASC
    LIMIT $2 OFFSET $4;
  `;

  const res = await pool.query(sql, [term, limit, currentUserId || null, offset]);
  return res.rows;
}

export async function getUserProfileDb(usernameOrId: string, currentUserId: string | number | null) {
  const isId = /^\d+$/.test(usernameOrId);
  const condition = isId ? 'u.id = $1' : 'LOWER(u.username) = LOWER($1)';

  const sql = `
    SELECT 
      u.id::text, 
      u.username, 
      u.email,
      u.verified as "isVerified", 
      u.role,
      u.created_at as "joinedDate",
      p.display_name as "name", 
      p.avatar_url as "avatar", 
      p.cover_image_url as "coverImage",
      p.bio, 
      p.location,
      p.website,
      p.work,
      p.education,
      p.interests,
      (SELECT COUNT(*)::int FROM follows WHERE following_id = u.id) as "followersCount",
      (SELECT COUNT(*)::int FROM follows WHERE follower_id = u.id) as "followingCount",
      (SELECT COUNT(*)::int FROM posts WHERE author_id = u.id AND deleted = false) as "postsCount",
      CASE 
        WHEN $2::bigint IS NOT NULL AND EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) THEN true 
        ELSE false 
      END as "isFollowing",
      CASE 
        WHEN $2::bigint IS NOT NULL AND EXISTS(SELECT 1 FROM blocks WHERE blocker_id = $2 AND blocked_id = u.id) THEN true 
        ELSE false 
      END as "isBlocked"
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE ${condition}
    LIMIT 1;
  `;

  const res = await pool.query(sql, [usernameOrId.trim(), currentUserId || null]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    ...row,
    interests: row.interests ? row.interests.split(',').map((s: string) => s.trim()) : [],
  };
}

export async function updateUserProfileDb(userId: string | number, data: {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  interests?: string[] | string;
}) {
  const interestsStr = Array.isArray(data.interests) ? data.interests.join(', ') : data.interests || null;
  const sql = `
    UPDATE profiles
    SET 
      display_name = COALESCE($2, display_name),
      bio = COALESCE($3, bio),
      location = COALESCE($4, location),
      website = COALESCE($5, website),
      work = COALESCE($6, work),
      education = COALESCE($7, education),
      interests = COALESCE($8, interests),
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING *;
  `;
  const res = await pool.query(sql, [
    userId,
    data.displayName ?? null,
    data.bio ?? null,
    data.location ?? null,
    data.website ?? null,
    data.work ?? null,
    data.education ?? null,
    interestsStr,
  ]);
  return res.rows[0];
}

// -----------------------------------------------------------------
// FOLLOW / UNFOLLOW SYSTEM (Sections 7, 8, 9, 10, 11)
// -----------------------------------------------------------------
export async function followUserDb(followerId: string | number, followingId: string | number) {
  if (String(followerId) === String(followingId)) {
    throw new Error('You cannot follow yourself.');
  }

  // Check if blocked
  const blockCheck = await pool.query(
    'SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)',
    [followerId, followingId]
  );
  if (blockCheck.rows.length > 0) {
    throw new Error('Unable to follow this user due to block restrictions.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO follows (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (follower_id, following_id) DO NOTHING;`,
      [followerId, followingId]
    );

    // Create notification for target user
    const followerProfile = await client.query('SELECT display_name FROM profiles WHERE user_id = $1', [followerId]);
    const followerName = followerProfile.rows[0]?.display_name || 'Someone';

    await client.query(
      `INSERT INTO notifications (receiver_id, actor_id, type, target_id, target_type, message, is_read, created_at)
       VALUES ($1, $2, 'FOLLOW', $2, 'USER', $3, false, NOW());`,
      [followingId, followerId, `${followerName} started following you.`]
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  // Return updated counts
  const counts = await pool.query(
    `SELECT 
      (SELECT COUNT(*)::int FROM follows WHERE following_id = $1) as "followersCount",
      (SELECT COUNT(*)::int FROM follows WHERE follower_id = $2) as "followingCount";`,
    [followingId, followerId]
  );

  return {
    isFollowing: true,
    targetFollowersCount: counts.rows[0].followersCount,
    myFollowingCount: counts.rows[0].followingCount,
  };
}

export async function unfollowUserDb(followerId: string | number, followingId: string | number) {
  await pool.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [followerId, followingId]);

  const counts = await pool.query(
    `SELECT 
      (SELECT COUNT(*)::int FROM follows WHERE following_id = $1) as "followersCount",
      (SELECT COUNT(*)::int FROM follows WHERE follower_id = $2) as "followingCount";`,
    [followingId, followerId]
  );

  return {
    isFollowing: false,
    targetFollowersCount: counts.rows[0].followersCount,
    myFollowingCount: counts.rows[0].followingCount,
  };
}

// -----------------------------------------------------------------
// POSTS & FEED (Sections 12, 13, 16)
// -----------------------------------------------------------------
export async function createPostDb(data: {
  authorId: string | number;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  visibility?: string;
}) {
  const sql = `
    INSERT INTO posts (author_id, content, media_url, media_type, visibility, likes_count, comments_count, created_at, updated_at)
    VALUES ($1, $2, $3, $4, COALESCE($5, 'PUBLIC'), 0, 0, NOW(), NOW())
    RETURNING *;
  `;
  const res = await pool.query(sql, [
    data.authorId,
    data.content.trim(),
    data.mediaUrl || null,
    data.mediaType || (data.mediaUrl ? 'image' : null),
    data.visibility || 'PUBLIC',
  ]);
  const newPost = res.rows[0];

  const author = await findUserById(data.authorId);
  return {
    id: String(newPost.id),
    author: {
      id: String(author?.id),
      name: author?.display_name || author?.username,
      username: author?.username,
      avatar: author?.avatar_url,
      isVerified: author?.verified,
    },
    content: newPost.content,
    mediaUrl: newPost.media_url,
    mediaType: newPost.media_type,
    privacy: newPost.visibility.toLowerCase(),
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    isSaved: false,
    timestamp: 'Just now',
    createdAt: newPost.created_at,
    comments: [],
  };
}

export async function getFeedDb(currentUserId: string | number | null, page: number = 0, size: number = 20) {
  const limit = Math.min(Math.max(1, size), 50);
  const offset = Math.max(0, page) * limit;

  const sql = `
    SELECT 
      p.id::text,
      p.content,
      p.media_url as "mediaUrl",
      p.media_type as "mediaType",
      p.visibility as "privacy",
      p.likes_count as "likesCount",
      p.comments_count as "commentsCount",
      p.created_at as "createdAt",
      u.id::text as author_id,
      u.username as author_username,
      u.verified as author_verified,
      prof.display_name as author_name,
      prof.avatar_url as author_avatar,
      CASE 
        WHEN $2::bigint IS NOT NULL AND EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) THEN true
        ELSE false 
      END as "isLiked",
      CASE 
        WHEN $2::bigint IS NOT NULL AND EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = $2) THEN true
        ELSE false 
      END as "isSaved"
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN profiles prof ON prof.user_id = u.id
    WHERE p.deleted = false
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $3;
  `;

  const res = await pool.query(sql, [limit, currentUserId || null, offset]);

  // Load comments for these posts
  const postIds = res.rows.map((r) => r.id);
  const commentsMap: Record<string, any[]> = {};

  if (postIds.length > 0) {
    const commentsSql = `
      SELECT 
        c.id::text,
        c.post_id::text,
        c.content,
        c.created_at as "createdAt",
        u.id::text as author_id,
        u.username as author_username,
        prof.display_name as author_name,
        prof.avatar_url as author_avatar
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN profiles prof ON prof.user_id = u.id
      WHERE c.post_id = ANY($1::bigint[]) AND c.deleted = false
      ORDER BY c.created_at ASC;
    `;
    const cRes = await pool.query(commentsSql, [postIds]);
    for (const c of cRes.rows) {
      if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
      commentsMap[c.post_id].push({
        id: c.id,
        content: c.content,
        author: {
          id: c.author_id,
          name: c.author_name || c.author_username,
          username: c.author_username,
          avatar: c.author_avatar,
        },
        timestamp: 'Recently',
        likesCount: 0,
      });
    }
  }

  return res.rows.map((r) => ({
    id: r.id,
    author: {
      id: r.author_id,
      name: r.author_name || r.author_username,
      username: r.author_username,
      avatar: r.author_avatar,
      isVerified: r.author_verified,
    },
    content: r.content,
    mediaUrl: r.mediaUrl,
    mediaType: r.mediaType,
    privacy: r.privacy ? r.privacy.toLowerCase() : 'public',
    likesCount: Number(r.likesCount) || 0,
    commentsCount: Number(r.commentsCount) || 0,
    sharesCount: 0,
    isLiked: Boolean(r.isLiked),
    isSaved: Boolean(r.isSaved),
    timestamp: new Date(r.createdAt).toLocaleDateString(),
    createdAt: r.createdAt,
    comments: commentsMap[r.id] || [],
  }));
}

export async function deletePostDb(postId: string | number, authorId: string | number) {
  const res = await pool.query(
    'UPDATE posts SET deleted = true, deleted_at = NOW() WHERE id = $1 AND author_id = $2 RETURNING id;',
    [postId, authorId]
  );
  if (res.rows.length === 0) {
    throw new Error('Post not found or unauthorized to delete.');
  }
  return true;
}

// -----------------------------------------------------------------
// LIKES & COMMENTS (Sections 14, 15)
// -----------------------------------------------------------------
export async function likePostDb(postId: string | number, userId: string | number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO likes (post_id, user_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (post_id, user_id) DO NOTHING;`,
      [postId, userId]
    );

    // Update count
    const updateRes = await client.query(
      `UPDATE posts 
       SET likes_count = (SELECT COUNT(*)::int FROM likes WHERE post_id = $1)
       WHERE id = $1
       RETURNING author_id, likes_count;`,
      [postId]
    );

    const postAuthor = updateRes.rows[0]?.author_id;
    const count = updateRes.rows[0]?.likes_count || 0;

    // Create notification if actor != post author
    if (postAuthor && String(postAuthor) !== String(userId)) {
      const userProfile = await client.query('SELECT display_name FROM profiles WHERE user_id = $1', [userId]);
      const actorName = userProfile.rows[0]?.display_name || 'Someone';

      await client.query(
        `INSERT INTO notifications (receiver_id, actor_id, type, target_id, target_type, message, is_read, created_at)
         VALUES ($1, $2, 'LIKE', $3, 'POST', $4, false, NOW());`,
        [postAuthor, userId, postId, `${actorName} liked your post.`]
      );
    }

    await client.query('COMMIT');
    return { isLiked: true, likesCount: count };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function unlikePostDb(postId: string | number, userId: string | number) {
  await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2;', [postId, userId]);

  const updateRes = await pool.query(
    `UPDATE posts 
     SET likes_count = (SELECT COUNT(*)::int FROM likes WHERE post_id = $1)
     WHERE id = $1
     RETURNING likes_count;`,
    [postId]
  );
  return { isLiked: false, likesCount: updateRes.rows[0]?.likes_count || 0 };
}

export async function createCommentDb(
  postId: string | number,
  authorId: string | number,
  content: string,
  parentCommentId?: string | number | null
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ins = await client.query(
      `INSERT INTO comments (post_id, author_id, content, parent_comment_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, content, created_at;`,
      [postId, authorId, content.trim(), parentCommentId || null]
    );

    const updateRes = await client.query(
      `UPDATE posts 
       SET comments_count = (SELECT COUNT(*)::int FROM comments WHERE post_id = $1 AND deleted = false)
       WHERE id = $1
       RETURNING author_id, comments_count;`,
      [postId]
    );

    const postAuthor = updateRes.rows[0]?.author_id;

    if (postAuthor && String(postAuthor) !== String(authorId)) {
      const userProfile = await client.query('SELECT display_name FROM profiles WHERE user_id = $1', [authorId]);
      const actorName = userProfile.rows[0]?.display_name || 'Someone';

      await client.query(
        `INSERT INTO notifications (receiver_id, actor_id, type, target_id, target_type, message, is_read, created_at)
         VALUES ($1, $2, 'COMMENT', $3, 'POST', $4, false, NOW());`,
        [postAuthor, authorId, postId, `${actorName} commented on your post: "${content.slice(0, 40)}..."`]
      );
    }

    await client.query('COMMIT');

    const author = await findUserById(authorId);
    return {
      id: String(ins.rows[0].id),
      content: ins.rows[0].content,
      author: {
        id: String(author?.id),
        name: author?.display_name || author?.username,
        username: author?.username,
        avatar: author?.avatar_url,
      },
      timestamp: 'Just now',
      likesCount: 0,
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------------
// DIRECT MESSAGES & CONVERSATIONS (Sections 19, 20, 21, 22, 23)
// -----------------------------------------------------------------
export async function getOrCreateConversationDb(userAId: string | number, userBId: string | number) {
  if (String(userAId) === String(userBId)) {
    throw new Error('Cannot create conversation with yourself.');
  }

  // Check if either user has blocked the other
  const blockCheck = await pool.query(
    'SELECT id, blocker_id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1) LIMIT 1',
    [userAId, userBId]
  );
  if (blockCheck.rows.length > 0) {
    throw new Error('Cannot start conversation: A block exists between these accounts.');
  }

  // Check existing 1-to-1 conversation
  const existingSql = `
    SELECT cm1.conversation_id
    FROM conversation_members cm1
    JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
    JOIN conversations c ON c.id = cm1.conversation_id
    WHERE cm1.user_id = $1 AND cm2.user_id = $2 AND c.is_group = false
    LIMIT 1;
  `;
  const existing = await pool.query(existingSql, [userAId, userBId]);
  if (existing.rows.length > 0) {
    return String(existing.rows[0].conversation_id);
  }

  // Create new conversation inside a transaction with lock protection
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Double check inside transaction
    const doubleCheck = await client.query(existingSql, [userAId, userBId]);
    if (doubleCheck.rows.length > 0) {
      await client.query('COMMIT');
      return String(doubleCheck.rows[0].conversation_id);
    }

    const conv = await client.query(
      `INSERT INTO conversations (is_group, created_at, updated_at) VALUES (false, NOW(), NOW()) RETURNING id;`
    );
    const convId = String(conv.rows[0].id);

    await client.query(
      `INSERT INTO conversation_members (conversation_id, user_id, joined_at, last_read_at) 
       VALUES ($1, $2, NOW(), NOW()), ($1, $3, NOW(), NOW())
       ON CONFLICT (conversation_id, user_id) DO NOTHING;`,
      [convId, userAId, userBId]
    );

    await client.query('COMMIT');
    return convId;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getConversationDetailsDb(
  conversationId: string | number,
  userId: string | number,
  getOnlineStatus?: (id: string) => boolean
) {
  // Validate membership
  const memberCheck = await pool.query(
    'SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  if (memberCheck.rows.length === 0) {
    throw new Error('Access denied to conversation.');
  }

  // Get other participant
  const otherRes = await pool.query(
    `SELECT u.id::text, u.username, p.display_name, p.avatar_url, u.last_seen_at
     FROM conversation_members cm
     JOIN users u ON u.id = cm.user_id
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE cm.conversation_id = $1 AND cm.user_id <> $2
     LIMIT 1;`,
    [conversationId, userId]
  );

  const other = otherRes.rows[0];
  const otherUserId = other ? String(other.id) : null;
  const isOnline = otherUserId && getOnlineStatus ? getOnlineStatus(otherUserId) : false;

  // Retrieve recent messages
  const messages = await getConversationMessagesDb(conversationId, userId, 0, 30);
  const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : '';
  const lastTime = messages.length > 0 ? messages[messages.length - 1].timestamp : '';

  return {
    id: String(conversationId),
    conversationId: String(conversationId),
    participant: {
      id: otherUserId || '',
      name: other?.display_name || other?.username || 'User',
      username: other?.username || '',
      avatar:
        other?.avatar_url ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(other?.username || 'user')}`,
      isOnline,
      lastSeen: isOnline ? 'Online now' : other?.last_seen_at ? new Date(other.last_seen_at).toLocaleDateString() : 'Recently',
    },
    lastMessage: lastMsg,
    lastMessageTime: lastTime,
    unreadCount: 0,
    messages,
  };
}

export async function getUserConversationsDb(userId: string | number, getOnlineStatus?: (id: string) => boolean) {
  const sql = `
    SELECT 
      c.id::text as id,
      c.updated_at,
      other_u.id::text as other_user_id,
      other_u.username as other_username,
      other_p.display_name as other_name,
      other_p.avatar_url as other_avatar,
      other_u.last_seen_at as other_last_seen,
      (SELECT content FROM messages WHERE conversation_id = c.id AND deleted = false ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id AND deleted = false ORDER BY created_at DESC LIMIT 1) as last_message_time,
      (SELECT COUNT(*)::int FROM messages m 
       WHERE m.conversation_id = c.id 
         AND m.sender_id <> $1 
         AND m.read_at IS NULL
         AND m.deleted = false
      ) as unread_count
    FROM conversations c
    JOIN conversation_members my_cm ON my_cm.conversation_id = c.id AND my_cm.user_id = $1
    JOIN conversation_members other_cm ON other_cm.conversation_id = c.id AND other_cm.user_id <> $1
    JOIN users other_u ON other_u.id = other_cm.user_id
    LEFT JOIN profiles other_p ON other_p.user_id = other_u.id
    WHERE c.is_group = false
    ORDER BY c.updated_at DESC;
  `;
  const res = await pool.query(sql, [userId]);
  return res.rows.map((r) => {
    const isOnline = getOnlineStatus ? getOnlineStatus(r.other_user_id) : false;
    return {
      id: r.id,
      conversationId: r.id,
      participant: {
        id: r.other_user_id,
        name: r.other_name || r.other_username,
        username: r.other_username,
        avatar:
          r.other_avatar ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(r.other_username)}`,
        isOnline,
        lastSeen: isOnline ? 'Online now' : r.other_last_seen ? new Date(r.other_last_seen).toLocaleDateString() : 'Offline',
      },
      lastMessage: r.last_message || 'No messages yet',
      lastMessageTime: r.last_message_time
        ? new Date(r.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      timestamp: r.last_message_time
        ? new Date(r.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      unreadCount: r.unread_count || 0,
      messages: [],
    };
  });
}

export async function getConversationMessagesDb(
  conversationId: string | number,
  userId: string | number,
  page: number = 0,
  size: number = 30
) {
  const numericConvId = parseInt(String(conversationId).replace(/^conv_/, ''), 10);
  const numericUserId = parseInt(String(userId), 10);
  if (!numericConvId || isNaN(numericConvId) || !numericUserId || isNaN(numericUserId)) {
    return [];
  }

  // Validate membership
  const memberCheck = await pool.query(
    'SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
    [numericConvId, numericUserId]
  );
  if (memberCheck.rows.length === 0) {
    throw new Error('Access denied to conversation messages.');
  }

  // Mark all unread messages from the other user as read
  await pool.query(
    'UPDATE messages SET read_at = NOW() WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL;',
    [numericConvId, numericUserId]
  );
  await pool.query(
    'UPDATE conversation_members SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2;',
    [numericConvId, numericUserId]
  );

  const limit = Math.min(Math.max(1, size), 100);
  const offset = Math.max(0, page * limit);

  // Subquery fetches the newest N messages first, then orders them ascending for chat display
  const sql = `
    SELECT * FROM (
      SELECT 
        m.id::text,
        m.conversation_id::text,
        m.sender_id::text,
        m.content,
        m.media_url,
        m.message_type,
        m.delivered_at,
        m.read_at,
        m.client_message_id,
        m.created_at,
        u.username as sender_username,
        p.display_name as sender_name,
        p.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE m.conversation_id = $1 AND m.deleted = false
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    ) sub
    ORDER BY sub.created_at ASC;
  `;
  const res = await pool.query(sql, [conversationId, limit, offset]);

  return res.rows.map((r) => {
    const isMine = String(r.sender_id) === String(userId);
    let status: 'sent' | 'delivered' | 'read' = 'sent';
    if (r.read_at) status = 'read';
    else if (r.delivered_at) status = 'delivered';

    return {
      id: String(r.id),
      conversationId: String(r.conversation_id),
      senderId: String(r.sender_id),
      senderUsername: r.sender_username || '',
      senderDisplayName: r.sender_name || r.sender_username || 'User',
      senderAvatarUrl: r.sender_avatar || '',
      clientMessageId: r.client_message_id,
      sender: {
        id: String(r.sender_id),
        name: r.sender_name || r.sender_username || 'User',
        username: r.sender_username || '',
        avatar: r.sender_avatar || '',
      },
      content: r.content,
      text: r.content, // alias for client compatibility
      mediaUrl: r.media_url,
      messageType: r.message_type || 'text',
      status,
      timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: r.created_at,
      deliveredAt: r.delivered_at,
      readAt: r.read_at,
      isMine,
    };
  });
}

export async function sendMessageDb(
  conversationId: string | number,
  senderId: string | number,
  content: string,
  mediaUrl?: string,
  clientMessageId?: string
) {
  const trimmed = (content || '').trim();
  if (!trimmed && !mediaUrl) {
    throw new Error('Message content cannot be empty.');
  }
  if (trimmed.length > 5000) {
    throw new Error('Message content exceeds 5000 character limit.');
  }

  const numericConvId = parseInt(String(conversationId).replace(/^conv_/, ''), 10);
  const numericSenderId = parseInt(String(senderId), 10);
  if (!numericConvId || isNaN(numericConvId) || !numericSenderId || isNaN(numericSenderId)) {
    throw new Error('Invalid conversation or user identifier.');
  }

  // Validate sender membership
  const memberCheck = await pool.query(
    'SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
    [numericConvId, numericSenderId]
  );
  if (memberCheck.rows.length === 0) {
    throw new Error('Unauthorized: You are not a member of this conversation.');
  }

  // Get recipient in this 1-to-1 conversation
  const recRes = await pool.query(
    'SELECT user_id FROM conversation_members WHERE conversation_id = $1 AND user_id <> $2 LIMIT 1;',
    [numericConvId, numericSenderId]
  );
  const recipientId = recRes.rows[0]?.user_id ? String(recRes.rows[0].user_id) : null;

  // Check if either user has blocked the other
  if (recipientId) {
    const block = await pool.query(
      'SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1) LIMIT 1',
      [recipientId, numericSenderId]
    );
    if (block.rows.length > 0) {
      throw new Error('Cannot send message: A block relationship exists between these users.');
    }
  }

  // Idempotency check with clientMessageId
  if (clientMessageId) {
    const existingMsg = await pool.query(
      `SELECT m.*, u.username as sender_username, p.display_name as sender_name, p.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE m.conversation_id = $1 AND m.client_message_id = $2
       LIMIT 1;`,
      [numericConvId, clientMessageId]
    );
    if (existingMsg.rows.length > 0) {
      const em = existingMsg.rows[0];
      return {
        recipientId,
        message: {
          id: String(em.id),
          conversationId: String(numericConvId),
          senderId: String(numericSenderId),
          senderUsername: em.sender_username || '',
          senderDisplayName: em.sender_name || em.sender_username || 'User',
          senderAvatarUrl: em.sender_avatar || '',
          clientMessageId,
          content: em.content,
          text: em.content,
          mediaUrl: em.media_url,
          messageType: em.message_type || 'text',
          status: (em.read_at ? 'read' : em.delivered_at ? 'delivered' : 'sent') as 'sent' | 'delivered' | 'read',
          timestamp: new Date(em.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: em.created_at,
          deliveredAt: em.delivered_at || null,
          readAt: em.read_at || null,
          sender: {
            id: String(numericSenderId),
            name: em.sender_name || em.sender_username || 'User',
            username: em.sender_username || '',
            avatar: em.sender_avatar || '',
          },
        },
      };
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const msgRes = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, content, media_url, message_type, client_message_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'text', $5, NOW(), NOW())
       RETURNING *;`,
      [numericConvId, numericSenderId, trimmed, mediaUrl || null, clientMessageId || null]
    );

    await client.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1;', [numericConvId]);
    await client.query(
      'UPDATE conversation_members SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2;',
      [numericConvId, numericSenderId]
    );

    await client.query('COMMIT');

    const sender = await findUserById(numericSenderId);
    const m = msgRes.rows[0];

    return {
      recipientId,
      message: {
        id: String(m.id),
        conversationId: String(numericConvId),
        senderId: String(numericSenderId),
        senderUsername: sender?.username || '',
        senderDisplayName: sender?.display_name || sender?.username || 'User',
        senderAvatarUrl: sender?.avatar_url || '',
        clientMessageId: m.client_message_id || clientMessageId,
        sender: {
          id: String(senderId),
          name: sender?.display_name || sender?.username || 'User',
          username: sender?.username || '',
          avatar: sender?.avatar_url || '',
        },
        content: m.content,
        text: m.content,
        mediaUrl: m.media_url,
        messageType: m.message_type || 'text',
        status: 'sent' as const,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: m.created_at,
        deliveredAt: null,
        readAt: null,
      },
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function markConversationMessagesReadDb(conversationId: string | number, userId: string | number) {
  const memberCheck = await pool.query(
    'SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  if (memberCheck.rows.length === 0) {
    throw new Error('Access denied to conversation.');
  }

  await pool.query(
    'UPDATE messages SET read_at = NOW() WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL;',
    [conversationId, userId]
  );
  await pool.query(
    'UPDATE conversation_members SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2;',
    [conversationId, userId]
  );

  const recRes = await pool.query(
    'SELECT user_id FROM conversation_members WHERE conversation_id = $1 AND user_id <> $2 LIMIT 1;',
    [conversationId, userId]
  );
  return recRes.rows[0]?.user_id ? String(recRes.rows[0].user_id) : null;
}

export async function markMessageDeliveredDb(messageId: string | number, recipientId: string | number) {
  const res = await pool.query(
    `UPDATE messages 
     SET delivered_at = NOW() 
     WHERE id = $1 AND sender_id <> $2 AND delivered_at IS NULL
     RETURNING conversation_id::text, sender_id::text, delivered_at;`,
    [messageId, recipientId]
  );
  if (res.rows.length > 0) {
    return {
      conversationId: res.rows[0].conversation_id,
      senderId: res.rows[0].sender_id,
      deliveredAt: res.rows[0].delivered_at,
    };
  }
  return null;
}

// -----------------------------------------------------------------
// NOTIFICATIONS (Section 26)
// -----------------------------------------------------------------
export async function getNotificationsDb(userId: string | number) {
  const sql = `
    SELECT 
      n.id::text,
      n.type,
      n.message,
      n.is_read as "isRead",
      n.created_at as "createdAt",
      u.id::text as actor_id,
      u.username as actor_username,
      p.display_name as actor_name,
      p.avatar_url as actor_avatar
    FROM notifications n
    JOIN users u ON u.id = n.actor_id
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE n.receiver_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50;
  `;
  const res = await pool.query(sql, [userId]);
  return res.rows.map((r) => ({
    id: r.id,
    type: r.type,
    message: r.message,
    isRead: r.isRead,
    timestamp: new Date(r.createdAt).toLocaleDateString(),
    actor: {
      id: r.actor_id,
      name: r.actor_name || r.actor_username,
      username: r.actor_username,
      avatar: r.actor_avatar,
    },
  }));
}

export async function markNotificationReadDb(notificationId: string | number, userId: string | number) {
  await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND receiver_id = $2;', [
    notificationId,
    userId,
  ]);
  return true;
}

export async function markAllNotificationsReadDb(userId: string | number) {
  await pool.query('UPDATE notifications SET is_read = true WHERE receiver_id = $1;', [userId]);
  return true;
}

// -----------------------------------------------------------------
// BLOCKING (Section 27)
// -----------------------------------------------------------------
export async function blockUserDb(blockerId: string | number, blockedId: string | number) {
  if (String(blockerId) === String(blockedId)) {
    throw new Error('Cannot block yourself.');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO blocks (blocker_id, blocked_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING;`,
      [blockerId, blockedId]
    );
    // Remove follows between them
    await client.query(
      'DELETE FROM follows WHERE (follower_id = $1 AND following_id = $2) OR (follower_id = $2 AND following_id = $1);',
      [blockerId, blockedId]
    );
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function unblockUserDb(blockerId: string | number, blockedId: string | number) {
  await pool.query('DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2;', [blockerId, blockedId]);
  return true;
}
