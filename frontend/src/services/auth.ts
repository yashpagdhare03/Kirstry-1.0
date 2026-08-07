import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
  store?: any;
  has_store?: boolean;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface StoreSetupPayload {
  store_name: string;
  address?: string;
  gstin?: string;
  phone?: string;
}

export const authService = {
  async signup(payload: SignUpPayload) {
    return api.post<AuthResponse>('/auth/signup', payload);
  },

  async login(payload: LoginPayload) {
    return api.post<AuthResponse>('/auth/login', payload);
  },

  async googleAuth(idToken: string) {
    return api.post<AuthResponse>('/auth/google', { id_token: idToken });
  },

  async storeSetup(payload: StoreSetupPayload) {
    return api.post<any>('/auth/store-setup', payload);
  },

  async refreshToken(refreshToken: string) {
    return api.post<AuthSession>('/auth/refresh', { refresh_token: refreshToken });
  },

  async getMe() {
    return api.get<{ user: AuthUser; store: any; has_store?: boolean }>('/auth/me');
  },

  async syncProfile() {
    return api.post<{ status: string; user: AuthUser; store?: any; has_store: boolean }>('/auth/sync-profile', {});
  },
};

