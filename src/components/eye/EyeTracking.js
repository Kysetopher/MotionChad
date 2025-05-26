import React, { useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import { gsap } from 'gsap';
import '../../styles/EyeTracking.css';
import RotatingSwirl from './RotatingSwirl';
import { EyeOffline } from './EyeAnimation';
import { useRouter } from 'next/router';

const EyeTracking = ({ onClick }) => {
  const { reverieData, scramble, setScramble,  mobileClient, pageSTATES, pageState, userInput } = useGeneralContext();
  const [blinking, setBlinking] = useState(false);
  
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();



  useEffect(() => {
    setScramble(false);
  }, [router.query.id]);
  useEffect(() => {
    // if(reverieData) console.log(reverieData.is_streaming);
  }, [reverieData]);
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
  
    updateOnlineStatus();
  
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) return;

    gsap.set('.lid--upper', { attr: { d: 'M1 12C1 12 5 20 12 20C19 20 23 12 23 12' } });
    gsap.set('.eyeball', { opacity: 0 });

    const EYE = document.querySelector('.eyeball');
    const posMapper = gsap.utils.mapRange(-100, 100, 30, -30);

    const handlePointerMove = ({ x, y }) => {
      setBlinking(false);
      const BOUNDS = EYE.getBoundingClientRect();
      gsap.set('.eyeball', {
        xPercent: gsap.utils.clamp(-30, 30, posMapper(BOUNDS.x - x)),
        yPercent: gsap.utils.clamp(-30, 30, posMapper(BOUNDS.y - y)),
        opacity: 1,
      });
      gsap.to('.lid--upper', { attr: { d: 'M1 12C1 12 5 4 12 4C19 4 23 12 23 12' }, duration: 0.4 });
    };

    const handleMouseLeave = () => {
      setBlinking(true);
      gsap.timeline()
        .to('.eyeball', { opacity: 0, duration: 0.3 })
        .to('.lid--upper', { attr: { d: 'M1 12C1 12 5 20 12 20C19 20 23 12 23 12' }, duration: .7 }, "-=0.25");
    };

    const handleMouseEnter = () => {
      setBlinking(false);
      gsap.set('.eyeball', { opacity: 0 }); 
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mouseleave', handleMouseLeave); 
    window.addEventListener('mouseenter', handleMouseEnter); 

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isOnline]);

  return (
    <button type="button" title="Cursor Tracking Eye" aria-pressed="false" className="eye-button" onClick={(e) => {
      setBlinking(true);
      blink();
      setBlinking(false);
      onClick();
    }}>
      {isOnline ? (
        <>
          {((reverieData && reverieData.is_streaming) || scramble) && !blinking && (<RotatingSwirl />)}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="eye-icon">
            <defs>
              <mask id="eye-open">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12V20H12H1V12Z" fill="#D9D9D9" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
              </mask>
              <mask id="eye-closed">
                <path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12V20H12H1V12Z" fill="#D9D9D9" />
              </mask>
            </defs>
            <path className="lid lid--upper" d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="#00ff00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path className="lid lid--lower" d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="#00ff00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <g mask="url(#eye-open)">
              <g className="eyeball">
              { !(reverieData && reverieData.is_streaming) && (
                  <>
                    <circle cy="12" cx="12" r="2.7" fill="#00ff37f0" />
                    <circle cy="12" cx="12" r="2" fill="#00ff37f0" />
                  </>
                )}
              </g>
            </g>
          </svg>
        </>
      ) : (
        <EyeOffline />
      )}
    </button>
  );
};

export const blink = (duration = 0.4) => {
  gsap.timeline({ repeat: 0, yoyo: true })
    .to('.lid--upper', {
      attr: { d: 'M1 12C1 12 5 20 12 20C19 20 23 12 23 12' },
      duration: duration / 2,
      onStart: () => {
        gsap.to('.eyeball', { opacity: 0, duration: 0 });
      },
    })
    .to('.lid--upper', {
      attr: { d: 'M1 12C1 12 5 4 12 4C19 4 23 12 23 12' },
      duration: duration / 2,
      onStart: () => {
        gsap.to('.eyeball', { opacity: 0, duration: 0 });
      },
      onComplete: () => {
        gsap.to('.eyeball', { opacity: 1, duration: 0.1 });
        return;
      },
    });
};

export default EyeTracking;
