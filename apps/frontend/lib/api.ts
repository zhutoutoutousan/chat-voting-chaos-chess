const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      statusCode: response.status,
      message: response.statusText,
      error: 'Request failed',
    }));
    throw error;
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, username: string, password: string, name?: string) =>
    apiRequest<{ user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password, name }),
    }),

  getMe: () => apiRequest<any>('/auth/me'),
};

// Games API
export const gamesApi = {
  getGames: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiRequest<any[]>(`/games?${query.toString()}`);
  },

  getGame: (id: string) => apiRequest<any>(`/games/${id}`),

  createGame: (data: { opponentId: string; timeControl: string; isRated?: boolean; isChaosMode?: boolean }) =>
    apiRequest<any>('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  makeMove: (gameId: string, move: string) =>
    apiRequest<any>(`/games/${gameId}/moves`, {
      method: 'POST',
      body: JSON.stringify({ move }),
    }),

  resign: (gameId: string) =>
    apiRequest<any>(`/games/${gameId}/resign`, {
      method: 'POST',
    }),

  offerDraw: (gameId: string) =>
    apiRequest<any>(`/games/${gameId}/draw-offer`, {
      method: 'POST',
    }),

  acceptDraw: (gameId: string) =>
    apiRequest<any>(`/games/${gameId}/draw-accept`, {
      method: 'POST',
    }),
};

// Ratings API
export const ratingsApi = {
  getMyRatings: () => apiRequest<any[]>('/ratings/me'),

  getLeaderboard: (type: string, limit?: number, offset?: number) => {
    const query = new URLSearchParams();
    query.append('type', type);
    if (limit) query.append('limit', limit.toString());
    if (offset) query.append('offset', offset.toString());
    return apiRequest<any>(`/ratings/leaderboard?${query.toString()}`);
  },

  getRatingHistory: (userId: string, type: string) =>
    apiRequest<any>(`/ratings/${userId}/history?type=${type}`),
};

// Voting API
export const votingApi = {
  startVoting: (gameId: string, duration?: number) =>
    apiRequest<any>(`/voting/games/${gameId}/start`, {
      method: 'POST',
      body: JSON.stringify({ duration }),
    }),

  submitVote: (gameId: string, vote: string | number) =>
    apiRequest<any>(`/voting/games/${gameId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    }),

  getVotingStatus: (gameId: string) => apiRequest<any>(`/voting/games/${gameId}/status`),

  endVoting: (gameId: string) =>
    apiRequest<any>(`/voting/games/${gameId}/end`, {
      method: 'POST',
    }),
};

// Chat API
export const chatApi = {
  getMessages: (gameId: string, limit?: number, before?: Date) => {
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit.toString());
    if (before) query.append('before', before.toISOString());
    return apiRequest<any[]>(`/chat/games/${gameId}/messages?${query.toString()}`);
  },

  sendMessage: (gameId: string, message: string) =>
    apiRequest<any>(`/chat/games/${gameId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
