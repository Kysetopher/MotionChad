import { forceLogin } from '../utils/supabase/forceLogin';
import React from 'react';
import '../styles/LandingPage.css';

export async function getServerSideProps(context) {
  return forceLogin(context);
}

const AppContent = () => {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/login';
  };
  return (
    <div className="login-content">
      <button className="rounded-lg google-login-button" onClick={handleGoogleLogin}>
        <img src="google/icon.svg" alt="Google icon" />
        Sign in with Google
      </button>
    </div>
  );
};

export default function HomePage() {
  return <AppContent />;
}
