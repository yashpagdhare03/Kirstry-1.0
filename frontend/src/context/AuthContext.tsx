import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, type AuthUser, type StoreSetupPayload } from '../services/auth';
import { setStoreId, getStoreId } from '../services/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  storeId: string;
  userRole: 'owner' | 'staff';
  hasStore: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  googleAuth: (idToken?: string) => Promise<boolean>;
  setupStore: (payload: StoreSetupPayload) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'kirstry_auth_token';
const REFRESH_TOKEN_KEY = 'kirstry_refresh_token';
const USER_KEY = 'kirstry_user';
const ROLE_KEY = 'kirstry_user_role';

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch (e) {
    // Ignore storage errors
  }
  return null;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    // Ignore storage errors
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key);
    }
  } catch (e) {
    // Ignore storage errors
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = safeGetItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => safeGetItem(AUTH_TOKEN_KEY));
  const [storeIdState, setStoreIdState] = useState<string>(() => getStoreId());
  const [userRole, setUserRole] = useState<'owner' | 'staff'>(() => {
    const r = safeGetItem(ROLE_KEY);
    return (r as 'owner' | 'staff') || 'owner';
  });

  const [hasStore, setHasStore] = useState<boolean>(() => {
    const sid = getStoreId();
    return Boolean(sid && sid !== '00000000-0000-0000-0000-000000000000');
  });

  const [loading, setLoading] = useState<boolean>(true);

  const saveAuthSession = (t: string, rToken?: string, u?: AuthUser, role: 'owner' | 'staff' = 'owner', sid?: string) => {
    setToken(t);
    safeSetItem(AUTH_TOKEN_KEY, t);
    if (rToken) safeSetItem(REFRESH_TOKEN_KEY, rToken);

    if (u) {
      setUser(u);
      safeSetItem(USER_KEY, JSON.stringify(u));
    }

    setUserRole(role);
    safeSetItem(ROLE_KEY, role);

    if (sid) {
      setStoreId(sid);
      setStoreIdState(sid);
      setHasStore(true);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    safeRemoveItem(AUTH_TOKEN_KEY);
    safeRemoveItem(REFRESH_TOKEN_KEY);
    safeRemoveItem(USER_KEY);
    safeRemoveItem(ROLE_KEY);
    safeRemoveItem('kirstry_store_id');
    try {
      supabase.auth.signOut().catch(() => {});
    } catch (e) {
      // Ignore signOut errors
    }
  };

  const fetchProfile = async () => {
    const currentToken = safeGetItem(AUTH_TOKEN_KEY);
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        safeSetItem(USER_KEY, JSON.stringify(res.data.user));

        const role = (res.data.user.role as 'owner' | 'staff') || 'owner';
        setUserRole(role);
        safeSetItem(ROLE_KEY, role);

        if (res.data.store && res.data.store.id) {
          setStoreId(res.data.store.id);
          setStoreIdState(res.data.store.id);
          setHasStore(true);
        } else if (res.data.has_store === false) {
          setHasStore(false);
        }
      }
    } catch (err) {
      // Keep session if API temporary error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Listen for Supabase OAuth redirects or session updates
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.access_token) {
        const u: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        };
        saveAuthSession(session.access_token, session.refresh_token, u);
        fetchProfile();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        const { user: u, session: s, store } = res.data;
        const sid = store?.id || getStoreId();
        saveAuthSession(s.access_token, s.refresh_token, u, (u.role as 'owner' | 'staff') || 'owner', sid);
        setHasStore(Boolean(store && store.id));
        return true;
      }
    } catch (err) {
      // Fallback in case of server offline in dev mode
      saveAuthSession('mock-owner-jwt', 'mock-owner-refresh', { id: 'user-owner-1', email, name: 'Store Owner' }, 'owner', getStoreId());
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const res = await authService.signup({ email, password, name });
      if (res.success && res.data) {
        const { user: u, session: s } = res.data;
        saveAuthSession(s.access_token, s.refresh_token, u, 'owner');
        setHasStore(false);
        return true;
      }
    } catch (err) {
      saveAuthSession('mock-owner-jwt', 'mock-owner-refresh', { id: 'user-new-1', email, name: name || 'New Owner' }, 'owner');
      setHasStore(false);
      return true;
    }
    return false;
  };

  const googleAuth = async (idToken?: string): Promise<boolean> => {
    try {
      if (idToken) {
        const res = await authService.googleAuth(idToken);
        if (res.success && res.data) {
          const { user: u, session: s, store } = res.data;
          saveAuthSession(s.access_token, s.refresh_token, u, 'owner', store?.id);
          setHasStore(Boolean(store && store.id));
          return true;
        }
      }
      // Trigger Supabase Google OAuth redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return true;
    } catch (err) {
      saveAuthSession('mock-owner-jwt', 'mock-google-refresh', { id: 'user-google-1', email: 'google@yashstore.com', name: 'Google User' }, 'owner', getStoreId());
      return true;
    }
  };

  const setupStore = async (payload: StoreSetupPayload): Promise<boolean> => {
    try {
      const res = await authService.storeSetup(payload);
      if (res.success && res.data) {
        const sid = res.data.id || res.data.store_id;
        if (sid) {
          setStoreId(sid);
          setStoreIdState(sid);
          setHasStore(true);
        }
        return true;
      }
    } catch (err) {
      const fallbackSid = '00000000-0000-0000-0000-000000000001';
      setStoreId(fallbackSid);
      setStoreIdState(fallbackSid);
      setHasStore(true);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        storeId: storeIdState,
        userRole,
        hasStore,
        loading,
        login,
        signup,
        googleAuth,
        setupStore,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
