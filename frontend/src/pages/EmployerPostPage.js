import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmployerPostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('full_time');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('accessToken');
    const body = {
      title,
      description,
      location,
      category: category || undefined,
    };
    try {
      const res = await fetch('/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Could not create job';
        setError(msg);
        return;
      }
      navigate('/jobs');
    } catch {
      setError('Network error');
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 560 }}>
      <h1>Post a job</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Title
          <input
            data-testid="job-title"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
            required
            minLength={5}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Description
          <textarea
            data-testid="job-description"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={5}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
            required
            minLength={20}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Location
          <input
            data-testid="job-location"
            value={location}
            onChange={(ev) => setLocation(ev.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
            required
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Employment type
          <select
            data-testid="job-category"
            value={category}
            onChange={(ev) => setCategory(ev.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          >
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </label>
        {error ? (
          <p data-testid="job-post-error" style={{ color: 'crimson' }}>
            {error}
          </p>
        ) : null}
        <button data-testid="job-submit" type="submit">
          Publish job
        </button>
      </form>
    </main>
  );
}
