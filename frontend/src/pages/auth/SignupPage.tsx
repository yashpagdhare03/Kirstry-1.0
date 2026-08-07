import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/shared';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Store, UserPlus } from 'lucide-react';
import styles from './AuthPages.module.css';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, googleAuth } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter an email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const ok = await signup(email.trim(), password, name.trim() || undefined);
      if (ok) {
        navigate('/store-setup');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const ok = await googleAuth('mock-google-id-token');
      if (ok) {
        navigate('/store-setup');
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
          <h1 className={styles.authTitle}>Create Store Account</h1>
          <p className={styles.authSubtitle}>Set up your Kirana POS store account in 1 minute</p>
        </div>

        {/* Google OAuth Button */}
        <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={googleLoading} text="Sign up with Google" />

        <div className={styles.divider}>or register with email</div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {error && (
            <div style={{ color: 'var(--state-error)', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Yash Pagdhare"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. owner@yashstore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password (min 6 chars) *"
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
            leftIcon={<UserPlus size={16} />}
            style={{ width: '100%', marginTop: '4px' }}
          >
            Create Account & Next Step
          </Button>
        </form>

        {/* Footer link to login */}
        <div className={styles.authFooter}>
          Already have an account?
          <Link to="/login" className={styles.authLink}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
