import { useParams } from 'react-router-dom';
import { problemSets } from '../data/problemSets';

export function ProblemSetPage() {
  const { slug } = useParams();
  const set = problemSets.find((item) => item.slug === slug);

  if (!set) return <div className="app-shell">Set not found</div>;

  return (
    <div className="app-shell">
      <h1>{set.title}</h1>
      <p style={{ color: 'var(--muted)' }}>{set.description}</p>
      <div className="card" style={{ marginTop: 18 }}>
        {set.topics.map((topic) => (
          <div key={topic.name} style={{ marginBottom: 16 }}>
            <h3>{topic.name}</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {topic.problems.map((problem) => (
                <div key={problem.slug} className="problem-row">
                  <input type="checkbox" />
                  <a className="problem-name selectable" href={problem.url} target="_blank" rel="noreferrer">{problem.name}</a>
                  <div className="platform-links">
                    <a href={`https://www.geeksforgeeks.org/?s=${encodeURIComponent(problem.name)}`} target="_blank" rel="noreferrer">GFG</a>
                    <a href={problem.url} target="_blank" rel="noreferrer">LeetCode</a>
                    <a href={problem.url.includes('neetcode.io') ? problem.url : `https://neetcode.io/problems/${problem.slug}`} target="_blank" rel="noreferrer">NeetCode</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
