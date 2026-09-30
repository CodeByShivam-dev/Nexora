/**
 * NEXORA API Client
 * Enterprise-grade client for authentication, profiles, social feed, and real-time messaging.
 */

export interface ApiResponse<T = any> {
  status: number;
  message?: string;
  data?: T;
  error?: string;
  retryAfter?: number;
}

export interface AuthUserData {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  interests?: string[] | string;
  role?: string;
  verified?: boolean;
  status?: string;
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  joinedDate?: string;
}

export interface AuthResponseData {
  token?: string;
  user?: AuthUserData;
  userId?: string;
  username?: string;
  email?: string;
  displayName?: string;
  otpCode?: string;
  requiresOtp?: boolean;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// Event emitter for global rate limiting notifications
export type RateLimitListener = (info: { message: string; retryAfter?: number }) => void;
const rateLimitListeners: RateLimitListener[] = [];

export const onRateLimitExceeded = (listener: RateLimitListener) => {
  rateLimitListeners.push(listener);
  return () => {
    const idx = rateLimitListeners.indexOf(listener);
    if (idx !== -1) rateLimitListeners.splice(idx, 1);
  };
};

const notifyRateLimit = (message: string, retryAfter?: number) => {
  rateLimitListeners.forEach((l) => l({ message, retryAfter }));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nexora:ratelimit', {
        detail: { message, retryAfter },
      })
    );
  }
};

class ApiService {
  private customBackendUrl: string = '';
  private ws: WebSocket | null = null;
  private wsListeners: ((data: any) => void)[] = [];
  private pendingWsQueue: any[] = [];
  private wsPingTimer: any = null;
  private wsWatchdogTimer: any = null;
  private wsReconnectTimer: any = null;
  private wsRetryCount: number = 0;
  private isWsAuthenticated: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.customBackendUrl = localStorage.getItem('nexora_backend_url') || '';

      // Reconnect immediately on network restore or tab visible
      window.addEventListener('online', () => {
        this.connectWebSocket(true);
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkOrReconnectWebSocket();
        }
      });
    }
  }

  public getBackendUrl(): string {
    return this.customBackendUrl;
  }

  public setBackendUrl(url: string): void {
    this.customBackendUrl = url.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      if (this.customBackendUrl) {
        localStorage.setItem('nexora_backend_url', this.customBackendUrl);
      } else {
        localStorage.removeItem('nexora_backend_url');
      }
    }
  }

  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('nexora_token');
  }

  public setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nexora_token', token);
    this.connectWebSocket();
  }

  public removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('nexora_token');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private getBaseUrl(): string {
    if (this.customBackendUrl) {
      return this.customBackendUrl;
    }
    return '';
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const primaryUrl = `${this.getBaseUrl()}${endpoint}`;

    try {
      let res: Response;
      try {
        res = await fetch(primaryUrl, {
          ...options,
          headers,
        });
      } catch (networkError) {
        if (this.customBackendUrl && primaryUrl.startsWith(this.customBackendUrl)) {
          console.warn(`External backend unreachable. Falling back to local endpoint ${endpoint}...`);
          res = await fetch(endpoint, {
            ...options,
            headers,
          });
        } else {
          throw networkError;
        }
      }

      if (res.status === 429) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch (_) {}
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
        const limitMsg =
          errorData.message ||
          `Rate limit exceeded: Too many attempts. Please try again after ${retryAfter}s.`;

        notifyRateLimit(limitMsg, retryAfter);

        return {
          status: 429,
          error: 'Too Many Requests',
          message: limitMsg,
          retryAfter,
        };
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          status: res.status,
          error: json.error || 'Request Error',
          message: json.message || `Request failed with HTTP status ${res.status}`,
          data: json.data,
        };
      }

      return json;
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err);
      return {
        status: 0,
        error: 'Network Error',
        message: err.message || 'Network connection error.',
      };
    }
  }

  // -------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------
  async register(params: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return this.request<AuthResponseData>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async login(params: {
    identifier: string;
    password: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    const res = await this.request<AuthResponseData>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: params.identifier,
        emailOrUsername: params.identifier,
        email: params.identifier,
        password: params.password,
      }),
    });

    if (res.status === 200 && res.data?.token) {
      this.setToken(res.data.token);
    }

    return res;
  }

  async verifyOtp(params: {
    email?: string;
    username?: string;
    userId?: string;
    otp: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    const res = await this.request<AuthResponseData>('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        code: params.otp,
      }),
    });

    if (res.status === 200 && res.data?.token) {
      this.setToken(res.data.token);
    }

    return res;
  }

  async resendOtp(params: { email?: string; userId?: string; username?: string }) {
    return this.request<{ otpCode: string; email: string }>('/api/v1/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUserData>> {
    return this.request<AuthUserData>('/api/v1/auth/me', {
      method: 'GET',
    });
  }

  // -------------------------------------------------------------
  // USER SEARCH (Section 4, 5)
  // -------------------------------------------------------------
  async searchUsers(query: string, page: number = 0, size: number = 20): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/search/users?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      method: 'GET',
    });
  }

  // -------------------------------------------------------------
  // USER PROFILE (Section 6)
  // -------------------------------------------------------------
  async getUserProfile(usernameOrId: string): Promise<ApiResponse<AuthUserData>> {
    return this.request<AuthUserData>(`/api/v1/users/${encodeURIComponent(usernameOrId)}`, {
      method: 'GET',
    });
  }

  async updateProfile(data: {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
    work?: string;
    education?: string;
    interests?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // -------------------------------------------------------------
  // FOLLOW / UNFOLLOW (Sections 7, 8, 9, 10, 11)
  // -------------------------------------------------------------
  async followUser(userId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  // -------------------------------------------------------------
  // POSTS & FEED (Sections 12, 13)
  // -------------------------------------------------------------
  async getFeed(page: number = 0, size: number = 20): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/feed?page=${page}&size=${size}`, {
      method: 'GET',
    });
  }

  async createPost(data: {
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    visibility?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // -------------------------------------------------------------
  // LIKES & COMMENTS (Sections 14, 15)
  // -------------------------------------------------------------
  async likePost(postId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }

  async addComment(postId: string | number, content: string, parentCommentId?: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  // -------------------------------------------------------------
  // PHOTO UPLOADS (Sections 16, 17, 18)
  // -------------------------------------------------------------
  async uploadFile(file: File): Promise<ApiResponse<{ mediaUrl: string; mediaType: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ mediaUrl: string; mediaType: string }>('/api/v1/uploads', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request<{ avatarUrl: string }>('/api/v1/users/me/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadCover(file: File): Promise<ApiResponse<{ coverUrl: string }>> {
    const formData = new FormData();
    formData.append('cover', file);
    return this.request<{ coverUrl: string }>('/api/v1/users/me/cover', {
      method: 'POST',
      body: formData,
    });
  }

  // -------------------------------------------------------------
  // DIRECT MESSAGING & CONVERSATIONS (Sections 19, 20, 21, 22)
  // -------------------------------------------------------------
  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/v1/conversations', {
      method: 'GET',
    });
  }

  async createConversation(recipientId: string | number): Promise<ApiResponse<{ conversationId: string }>> {
    return this.request<{ conversationId: string }>('/api/v1/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  }

  async getMessages(conversationId: string | number): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/conversations/${conversationId}/messages`, {
      method: 'GET',
    });
  }

  async sendMessage(conversationId: string | number, content: string, mediaUrl?: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, mediaUrl }),
    });
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS (Section 26)
  // -------------------------------------------------------------
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/v1/notifications', {
      method: 'GET',
    });
  }

  async markNotificationRead(id: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // -------------------------------------------------------------
  // BLOCKING (Section 27)
  // -------------------------------------------------------------
  async blockUser(userId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/users/${userId}/block`, {
      method: 'POST',
    });
  }

  async unblockUser(userId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/users/${userId}/block`, {
      method: 'DELETE',
    });
  }

  // -------------------------------------------------------------
  // SYSTEM HEALTH & DEFAULT SESSION
  // -------------------------------------------------------------
  async getHealthStatus(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>('/api/health', {
      method: 'GET',
    });
  }

  async ensureDefaultSession(): Promise<ApiResponse<AuthResponseData>> {
    const res = await this.request<AuthResponseData>('/api/v1/auth/default-session', {
      method: 'GET',
    });
    if (res.status === 200 && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  // -------------------------------------------------------------
  // WEBSOCKET FOR REAL-TIME LIVE MESSAGES (Sections 19, 21)
  // -------------------------------------------------------------
  public checkOrReconnectWebSocket(): void {
    if (!this.getToken()) return;
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
      this.connectWebSocket(true);
    }
  }

  public connectWebSocket(force: boolean = false): void {
    if (typeof window === 'undefined') return;
    const token = this.getToken();
    if (!token) return;

    if (!force && this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Clean up existing timer and socket if forcing reconnect
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }
    this.stopHeartbeat();

    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.wsRetryCount = 0;
        this.startHeartbeat();
        // Send explicit auth payload
        try {
          this.ws?.send(JSON.stringify({ type: 'auth', token }));
        } catch (_) {}
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'pong') {
            this.clearWatchdog();
            return;
          }

          if (data.type === 'authenticated') {
            this.isWsAuthenticated = true;
            this.flushPendingQueue();
          }

          this.wsListeners.forEach((l) => {
            try {
              l(data);
            } catch (err) {
              console.error('Error in WS message listener:', err);
            }
          });
        } catch (_) {}
      };

      this.ws.onerror = () => {
        // Socket error, trigger backoff reconnection
        this.isWsAuthenticated = false;
      };

      this.ws.onclose = () => {
        this.isWsAuthenticated = false;
        this.stopHeartbeat();

        // Exponential backoff with jitter if user is still logged in
        if (this.getToken()) {
          const delay = Math.min(1000 * Math.pow(1.5, this.wsRetryCount), 10000) + Math.random() * 500;
          this.wsRetryCount++;
          this.wsReconnectTimer = setTimeout(() => {
            this.connectWebSocket(true);
          }, delay);
        }
      };
    } catch (e) {
      console.warn('WebSocket connection error:', e);
      // Retry in 3s on exception
      this.wsReconnectTimer = setTimeout(() => {
        this.connectWebSocket(true);
      }, 3000);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    // Send ping every 20 seconds to keep connection alive through reverse proxies
    this.wsPingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
          // Set 10-second watchdog
          this.wsWatchdogTimer = setTimeout(() => {
            console.warn('WebSocket ping watchdog timeout. Reconnecting...');
            this.connectWebSocket(true);
          }, 10000);
        } catch (_) {
          this.connectWebSocket(true);
        }
      }
    }, 20000);
  }

  private clearWatchdog(): void {
    if (this.wsWatchdogTimer) {
      clearTimeout(this.wsWatchdogTimer);
      this.wsWatchdogTimer = null;
    }
  }

  private stopHeartbeat(): void {
    if (this.wsPingTimer) {
      clearInterval(this.wsPingTimer);
      this.wsPingTimer = null;
    }
    this.clearWatchdog();
  }

  private flushPendingQueue(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isWsAuthenticated) return;
    while (this.pendingWsQueue.length > 0) {
      const item = this.pendingWsQueue.shift();
      try {
        this.ws.send(JSON.stringify(item));
      } catch (err) {
        console.error('Failed to send queued WS message:', err);
      }
    }
  }

  public sendWebSocket(data: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isWsAuthenticated) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
    // Queue message for delivery upon connection/authentication
    this.pendingWsQueue.push(data);
    this.connectWebSocket();
    return false;
  }

  public async sendChatMessage(
    conversationId: string | number,
    content: string,
    mediaUrl?: string
  ): Promise<ApiResponse<any>> {
    const clientMessageId = `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Try WebSocket send first for instant sub-millisecond delivery
    const sentOverWs = this.sendWebSocket({
      type: 'send_message',
      conversationId: String(conversationId),
      content,
      mediaUrl,
      clientMessageId,
    });

    // Also persist through HTTP API endpoint if not a demo conversation, or if WS is reconnecting
    if (!String(conversationId).startsWith('conv_')) {
      try {
        const httpRes = await this.sendMessage(conversationId, content, mediaUrl);
        return httpRes;
      } catch (httpErr) {
        if (sentOverWs) {
          return { status: 201, data: { id: clientMessageId, content, mediaUrl } };
        }
        throw httpErr;
      }
    }

    return {
      status: 201,
      data: {
        id: clientMessageId,
        conversationId: String(conversationId),
        content,
        mediaUrl,
        timestamp: 'Just now',
      },
    };
  }

  public onWebSocketMessage(listener: (data: any) => void): () => void {
    this.wsListeners.push(listener);
    return () => {
      const idx = this.wsListeners.indexOf(listener);
      if (idx !== -1) this.wsListeners.splice(idx, 1);
    };
  }

  logout(): void {
    this.stopHeartbeat();
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }
    this.removeToken();
  }
}

export const api = new ApiService();
export default api;
