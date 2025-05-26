import React, { useEffect, useRef, useState} from 'react';
import { useGeneralContext} from '../../ContextProvider';
import LoadingSwirl from './LoadingSwirl.js';

const AppLoadingSplash = ( message ) => {
   
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    return (
        <div className="splash-branding">
            <img className="" src='/icon/heyjinn.svg' alt="search-empty"  />
            <div className="app-video-splash-full">
            {!isVideoLoaded && (
                <LoadingSplash/>
            )}
            <video
                className="splash-video"
                src="/splash/particle-veins.mp4"
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => setIsVideoLoaded(true)}
                onError={() => console.error('Video failed to load.')}
                style={{ display: isVideoLoaded ? 'block' : 'none' }}
            >
                Your browser does not support the video tag.
            </video>
            </div>
        </div>
        
    );
};


const EmptyCardContainer = ({ message }) => {
   
    return (
        <div className="empty-card-container">{( (message )? message : "no cards")}</div>
    );
};
const SearchNoReveries = ( message ) => {
   

    return (
        <div className="empty-card-container-full">
            <img className="splash-img" src='/splash/search.svg' alt="search-empty"  />
        </div>
    );
};

const AddNewCard = ( message ) => {
   

    return (
        <div className="empty-card-container-full">
            <img className="splash-img" src='/splash/add-card.svg' alt="splash-add-card"  />
        </div>
    );
};

const LoginSplash = ({ message }) => {
    const [theme, setTheme] = useState(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/login';
    };

    useEffect(() => {
        // Function to update theme based on preference
        const updateTheme = () => {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(isDarkMode ? 'dark' : 'light');
        };

        // Initial check
        updateTheme();

        // Listener for changes in theme preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', updateTheme);

        // Cleanup the event listener
        return () => mediaQuery.removeEventListener('change', updateTheme);
    }, []);

    return (
        <div className="app-video-splash-full">
            {!isVideoLoaded && (
                <LoadingSplash/>
            )}
            <video
                className="splash-video"
                src="/splash/particle-veins.mp4"
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => setIsVideoLoaded(true)}
                onError={() => console.error('Video failed to load.')}
                style={{ display: isVideoLoaded ? 'block' : 'none' }}
            >
                Your browser does not support the video tag.
            </video>
            <div className="login-page-branding">WISHH.AI</div>
            <div className="login-button-container">
                <img
                    className="google-login-button"
                    src="/google/web_custom_sq_SI.svg"
                    onClick={handleGoogleLogin}
                    alt="Login with Google"
                />
            </div>
        </div>
    );
};


const ChatSplash = () => {
  const { mobileClient } = useGeneralContext();
  const [videoSource, setVideoSource] = useState(null);

  // Tracks the state of the overlay: 'fade-in' or 'fade-out'
  const [overlayClass, setOverlayClass] = useState('');

  useEffect(() => {
    if (mobileClient == null) return;
    const timeouts = [];

    const totalVideos = mobileClient ? 5 : 6;

    const getRandomVideoSrc = () => {
      const randomIndex = Math.floor(Math.random() * totalVideos);
      const fileName = randomIndex.toString().padStart(2, '0') + '.mp4';
      return `/splash/${mobileClient ? 'mobile' : 'desktop'}/${fileName}`;
    };

    const getRandomPause = () => {
      const min = 100000;
      const max = 1000000;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function scheduleNextSequence() {
      // 1) Get a random video source
      const newSource = getRandomVideoSrc();
      // 2) Render the video and start with overlay = fully black
      setVideoSource(newSource);
      setOverlayClass('overlay-fade-in'); 

      const revealVideoTimeout = setTimeout(() => {
        setOverlayClass('overlay-fade-out'); // black overlay → 0 opacity
      }, 1000);

      const fadeOverlayTimeout = setTimeout(() => {
        setOverlayClass('overlay-fade-in');
      }, 11000);

      const hideVideoTimeout = setTimeout(() => {
        setVideoSource(null);
        const pauseDuration = getRandomPause();
        const pauseTimeout = setTimeout(() => {
          scheduleNextSequence();
        }, pauseDuration);
        timeouts.push(pauseTimeout);
      }, 12000);

      timeouts.push(revealVideoTimeout, fadeOverlayTimeout, hideVideoTimeout);
    }

    scheduleNextSequence();

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [mobileClient]);

  if (videoSource === null) {
    <div className={`video-overlay ${overlayClass}`} />
  }

  return (
    <div className="app-video-splash-full splash-background">
      <video
        className="splash-video"
        src={videoSource}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className={`video-overlay ${overlayClass}`} />
    </div>
  );
};

  

const LoadingSplash = ( message ) => {
   

    return (
        <div className="empty-card-container-full">
            <LoadingSwirl/>
        </div>
    );
};
const CardProcessingSplash = ( message ) => {
   

    return (
        <div className="app-video-splash-full">
              <video 
                className="splash-video-centered" 
                src='/splash/card-process-brain.mp4' 
                autoPlay 
                muted 
                loop 
                playsInline
                >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export {ChatSplash, EmptyCardContainer, SearchNoReveries, AppLoadingSplash, AddNewCard, LoginSplash, LoadingSplash , CardProcessingSplash };