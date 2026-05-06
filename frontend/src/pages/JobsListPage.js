import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/jobs?limit=100');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setLoadError('Could not load jobs');
          return;
        }
        if (!cancelled) setJobs(Array.isArray(data.data) ? data.data : []);
      } catch {
        if (!cancelled) setLoadError('Network error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => (j.title || '').toLowerCase().includes(q));
  }, [jobs, search]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Open roles</h1>
        <Link to="/login">Sign in</Link>
        <Link to="/employer/post">Post a job</Link>
      </header>
      <label style={{ display: 'block', margin: '1rem 0' }}>
        Search by title
        <input
          data-testid="job-search"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
          placeholder="Filter listings"
          style={{ display: 'block', width: '100%', maxWidth: 360, marginTop: 4 }}
        />
      </label>
      {loadError ? <p style={{ color: 'crimson' }}>{loadError}</p> : null}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map((job) => (
          <li
            key={job.id}
            data-testid="job-list-item"
            style={{ borderBottom: '1px solid #ddd', padding: '0.75rem 0' }}
          >
            <strong>{job.title}</strong>
            <div style={{ color: '#555', fontSize: '0.9rem' }}>{job.location}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
