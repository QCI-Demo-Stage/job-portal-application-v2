import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import EmployerPostPage from './pages/EmployerPostPage';
import JobsListPage from './pages/JobsListPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #eee' }}>
          <Link to="/jobs" style={{ marginRight: '1rem' }}>
            Jobs
          </Link>
          <Link to="/login" style={{ marginRight: '1rem' }}>
            Login
          </Link>
          <Link to="/employer/post">Employer post</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobsListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/employer/post" element={<EmployerPostPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
