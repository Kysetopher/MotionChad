import { forceLogin } from '../utils/supabase/forceLogin';
import TesseractCanvas from "../components/items/TesseractCanvas";
import React from 'react';
import { useGeneralContext } from '../ContextProvider';
import "../styles/LandingPage.css"; 
import { ScrambleHomepage }from '../components/items/ScrambleTyping';

const MESSAGES = [
  "                 The Future of Productivity",
  "                   AI-first user interface",
  "               Unmatched Productivity",
  "                              Train your perfect collaborator     ",
  "            Structured, retrievable insights     ",
  "                  The more you use Wishh.ai, the better it understands your habits and tailors recommendations specifically for you.     ",
  "                    Your data is safe with us. We never sell or compromise your information.     ",
  "                            Wishh.ai adapts to your needs     ",
  "                    Fully reprogrammable agent memory     ",
  "                    Transform your scattered thoughts into structured insights.     ",
  "                        Capture, organize, and act on your ideas with an AI-powered assistant that learns and adapts to your unique workflow     "
];

export async function getServerSideProps(context) {
  return forceLogin(context);
}

const AppContent = () => {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/login';
  };
  return (
    <>
      <TesseractCanvas />
      <div className="login-content">
        <img src="/icon/heyjinn.svg" alt="heyjinn-logo" className="heyjinn-logo" />
        <div className="glitch" data-text="Wishh.ai">Wishh.ai</div>
        <div className="subtitle-text">
          <h2>Your Personal Assistant, Reimagined.</h2>
          <p>Plan, create, and execute with a personalized AI that knows you.</p>
        </div>
       
          <div className="subtitle-text" ><ScrambleHomepage messages={MESSAGES} /></div>
       
        <button className="rounded-lg google-login-button" onClick={handleGoogleLogin}>
          <img src="google/icon.svg" alt="Google icon" />
          Sign in with Google
        </button>
      </div>
    </>
  );
};

export default function HomePage() {
  return <AppContent />;
}
