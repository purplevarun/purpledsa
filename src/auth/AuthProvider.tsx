import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type User = {
  id: string;
  username: string;
  name?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const saved = localStorage.getItem('purpledsa-user');
        if (saved) setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = async (username: string, password: string) => {
    if (!username || !password) throw new Error('Username and password required');

    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) throw new Error('Invalid username or password');

    const hash = data.passwordHash ?? '';
    if (!hash) throw new Error('Invalid username or password');

    const isValid = await comparePassword(password, hash);
    if (!isValid) throw new Error('Invalid username or password');

    const nextUser = {
      id: data.id,
      username: data.username,
      name: data.name,
    };
    setUser(nextUser);
    localStorage.setItem('purpledsa-user', JSON.stringify(nextUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('purpledsa-user');
  };

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function comparePassword(input: string, hash: string) {
  const text = new TextEncoder().encode(input);
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', text));
  const digest = Array.from(bytes)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
  return digest === hash;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
