/**
 * Authentication related data models
 */

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  name: string;
}

export interface TokenData {
  value: string;
  expiresAt: number;
}

export interface AuthResponse {
  success: boolean;
  error: string | null;
}
