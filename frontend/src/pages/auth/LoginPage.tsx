import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/shared';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Store, LogIn } from 'lucide-react';
import styles from './AuthPages.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const ok = await googleAuth();
      if (ok) {
        navigate('/');
      }
    } catch (err: any) {
      setError('Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        {/* Brand Logo Header */}
        <div className={styles.logoHeader}>
          <div className={styles.logoBadge}>
            <Store size={28} />
          </div>
          <h1 className={styles.authTitle}>Sign in to Kirstry POS</h1>
          <p className={styles.authSubtitle}>Kirana store inventory & billing manager</p>
        </div>

        {/* Google OAuth Button */}
        <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={googleLoading} />

        <div className={styles.divider}>or sign in with email</div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {error && (
            <div style={{ color: 'var(--state-error)', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. owner@yashstore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            leftIcon={<LogIn size={16} />}
            style={{ width: '100%', marginTop: '4px' }}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Footer link to signup */}
        <div className={styles.authFooter}>
          Don't have a store account?
          <Link to="/signup" className={styles.authLink}>
            Create new store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
