// ──────────────────────────────────────────────────────────────────────────────
// User & Auth
// ──────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Music / Tracks
// ──────────────────────────────────────────────────────────────────────────────

export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  releaseYear: number;
  coverUrl?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: Artist;
  album?: Album;
  durationMs: number;
  previewUrl?: string;
  externalId?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Playlist
// ──────────────────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  owner: User;
  tracks: Track[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// API Responses
// ──────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
