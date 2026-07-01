import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorBody, AuthSessionBody } from '../types/api';
import { formatApiMessage } from '../utils/formatApiMessage';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as AuthSessionBody & ApiErrorBody;
      if (!res.ok) {
        setError(formatApiMessage(data.message, 'Login failed'));
        return;
      }
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      navigate('/jobs');
    } catch {
      setError('Network error');
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 420 }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Email
          <input
            data-testid="login-email"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            autoComplete="username"
            style={{ display: 'block', width: '100%', marginTop: 4 }}
            required
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Password
          <input
            data-testid="login-password"
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            autoComplete="current-password"
            style={{ display: 'block', width: '100%', marginTop: 4 }}
            required
          />
        </label>
        {error ? (
          <p data-testid="login-error" style={{ color: 'crimson' }}>
            {error}
          </p>
        ) : null}
        <button data-testid="login-submit" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
