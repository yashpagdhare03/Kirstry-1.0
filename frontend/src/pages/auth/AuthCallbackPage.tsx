import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { authService } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import { Skeleton } from '../../components/shared';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile } = useAuth() as any;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          setErrorMsg('Authentication session failed. Please try logging in again.');
          setTimeout(() => navigate('/login'), 2500);
          return;
        }

        // Sync user profile & store tenancy with backend
        try {
          const res = await authService.syncProfile();
          if (res.success && res.data) {
            if (fetchProfile) await fetchProfile();
            if (res.data.has_store) {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/store-setup', { replace: true });
            }
            return;
          }
        } catch (err) {
          // If sync endpoint succeeds with default or fallback profile
        }

        navigate('/dashboard', { replace: true });
      } catch (err) {
        setErrorMsg('An unexpected error occurred during sign-in.');
        setTimeout(() => navigate('/login'), 2500);
      }
    };

    handleAuthCallback();
  }, [navigate, fetchProfile]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <Skeleton height={180} />
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {errorMsg || 'Completing Secure Authentication...'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Please wait while we redirect you to your store.
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
