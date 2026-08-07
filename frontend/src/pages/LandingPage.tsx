import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';
import { useAuth } from '../hooks/useAuth';
import { Store, Zap, Package, BookOpen, Truck, TrendingUp, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, hasStore } = useAuth();

  const handleDashboardClick = () => {
    if (token) {
      if (!hasStore) {
        navigate('/store-setup');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <header className={styles.navbar}>
        <Link to="/welcome" className={styles.brand}>
          <div className={styles.brandIcon}>
            <Store size={22} />
          </div>
          <span>Kirstry POS</span>
        </Link>

        <div className={styles.navActions}>
          {token ? (
            <Button variant="primary" onClick={handleDashboardClick} rightIcon={<ArrowRight size={16} />}>
              Open Store Dashboard
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate('/login')} leftIcon={<LogIn size={15} />}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Zap size={14} style={{ color: '#EAB308' }} />
          <span>AI-Assisted Smart Kirana Management</span>
        </div>

        <h1 className={styles.heroTitle}>
          Supercharge Your Kirana Store with Next-Gen POS & AI Inventory
        </h1>

        <p className={styles.heroSubtitle}>
          Lightning-fast barcode billing, real-time stock batch tracking, expiry alerts, digital customer Khata, and WhatsApp supplier purchase orders — built for Indian retail.
        </p>

        <div className={styles.ctaGroup}>
          <Button variant="primary" size="lg" onClick={() => navigate(token ? '/' : '/signup')} rightIcon={<ArrowRight size={18} />}>
            {token ? 'Go to Store Manager' : 'Start Free Store Account'}
          </Button>
          {!token && (
            <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
              Sign In Existing Store
            </Button>
          )}
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything Your Kirana Store Needs in One App</h2>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={22} />
            </div>
            <h3 className={styles.featureTitle}>POS Quick Billing</h3>
            <p className={styles.featureDesc}>
              Instant barcode scanner integration, Open Food Facts barcode lookup, tax receipt printing, and multiple payment options (Cash, UPI, Credit).
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Package size={22} />
            </div>
            <h3 className={styles.featureTitle}>Batch & Expiry Management</h3>
            <p className={styles.featureDesc}>
              Track stock remaining by batch number and receive automated alerts 7, 3, and 1 day before products expire to prevent store waste.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BookOpen size={22} />
            </div>
            <h3 className={styles.featureTitle}>Digital Khata Ledger</h3>
            <p className={styles.featureDesc}>
              Maintain trusted customer credit accounts, track total balance owed, record partial payments, and enforce credit limits.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Truck size={22} />
            </div>
            <h3 className={styles.featureTitle}>WhatsApp Supplier POs</h3>
            <p className={styles.featureDesc}>
              Manage wholesale vendor profiles, issue 3-step purchase orders (Draft → Sent → Received), and generate 1-click WhatsApp order links.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <TrendingUp size={22} />
            </div>
            <h3 className={styles.featureTitle}>Business Intelligence Analytics</h3>
            <p className={styles.featureDesc}>
              Recharts visual analytics for top fast-moving items, dead stock identification, revenue trends, and inventory asset valuation.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={22} />
            </div>
            <h3 className={styles.featureTitle}>Multi-Tenant Security & Auth</h3>
            <p className={styles.featureDesc}>
              Supabase Auth, Google OAuth sign-in, store owner vs cashier staff permissions, and isolated multi-tenant store database security.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Kirstry POS. All rights reserved. Built for Indian Kirana & Grocery Merchants.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
