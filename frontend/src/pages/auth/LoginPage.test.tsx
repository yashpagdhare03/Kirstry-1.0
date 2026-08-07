import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';

describe('LoginPage Component', () => {
  it('renders Sign in to Kirstry POS title, email input, and submit button', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Sign in to Kirstry POS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. owner@yashstore.com')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Dashboard')).toBeInTheDocument();
  });
});
