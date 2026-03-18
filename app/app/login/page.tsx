'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    login(email);
    router.push('/');
  };

  return (
    <main className="app-root login-page">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <LogIn size={28} />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to access the IT Service Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <span className="error-text">{error}</span>}
          </div>

          <button type="submit" className="btn-primary btn-full">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p className="role-hint">
            <ShieldAlert size={14} className="hint-icon" />
            Admins: admin@it.com
          </p>
        </div>
      </div>
    </main>
  );
}
