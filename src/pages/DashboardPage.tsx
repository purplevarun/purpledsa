import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { problemSets } from '../data/problemSets';

export function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">PurpleDSA</div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/sets/neetcode-150">NeetCode 150</Link>
          <Link to="/sets/top-interview">Top Interview</Link>
          <Link to="/sets/lld">LLD</Link>
        </nav>
        <div className="auth-box">
          {user ? (
            <>
              <span>{user.username}</span>
              <button onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <Link to="/login"><button className="primary">Sign in</button></Link>
          )}
        </div>
      </header>

      <section className="card">
        <h1>Track your DSA interview prep.</h1>
        <p style={{ color: 'var(--muted)' }}>Stay consistent and keep momentum on the problem sets you care about.</p>
      </section>

      <div className="grid grid-2" style={{ marginTop: 20 }}>
        {problemSets.map((set) => (
          <Link key={set.slug} to={`/sets/${set.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <h3>{set.title}</h3>
              <p style={{ color: 'var(--muted)' }}>{set.description}</p>
              <small>{set.topics.length} topics</small>
            </div>
          </Link>
        ))}
      </div>

      <footer>
        Built by <a href="https://github.com/purplevarun" target="_blank" rel="noreferrer">purplevarun</a>
      </footer>
    </div>
  );
}
