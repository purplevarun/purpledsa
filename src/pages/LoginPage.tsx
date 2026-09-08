import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setError('');
      await signIn(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 480, margin: '120px auto 0' }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p style={{ color: 'var(--muted)' }}>Use your username and password to track progress.</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="username">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
          <button type="submit" className="primary">Continue</button>
        </form>
      </div>
    </div>
  );
}
