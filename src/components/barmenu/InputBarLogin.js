import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import '../../styles/InputBar.css';
import { scrambleText } from '../items/ScrambleText';
import EyeTracking, { blink } from '../eye/EyeTracking';
import AgentBar from './AgentBar';
import { AddNewCard } from '../items/Splash';
import { useRouter } from 'next/router';

const InputBarLogin = () => {

  const { userInput = '', scramble, mobileClient, inputBarWrapRef, placeholder} = useGeneralContext();

  const [isMobileClient, setIsMobileClient] = useState(false);
  const [dragOverlay,  setDragOverlay] = useState(false);
  const [overlaySuccess, setOverlaySuccess] = useState(false);
  const router = useRouter();


  const inputBarRef = useRef(null);

  useEffect(() => {
    setIsMobileClient(mobileClient);
  }, [mobileClient]);



  useEffect(() => {
  }, [placeholder, userInput, scramble]);



  return (
    <div
      ref={inputBarWrapRef}
      className="input-bar-wrapper"
    >

      <div className={`inputbar-drag-overlay ${!dragOverlay? 'hidden-inputbar-overlay' : overlaySuccess?'full-inputbar-overlay' : ''}`}>
        <AddNewCard />
      </div>
      <div className="input-bar input-bar-mobile">
      <div className="input-bar-login">
                <img
                    className="google-login-button"
                    src="/google/web_custom_sq_SI.svg"
                    alt="Login with Google"
                />
            </div>
      </div>
    </div>
  );
};

export default InputBarLogin;