import React, {useRef, useState, useEffect } from 'react';
import InputBar from '../components/barmenu/InputBar';
import TopBar from '../components/barmenu/TopBar';
import InputBarMobile from '../components/barmenu/InputBarMobile';
import TopBarMobile from '../components/barmenu/TopBarMobile';
import NavAgent from '../components/view/Nav_Agent';
import AgentChat from '../components/view/AgentChat';
import { useGeneralContext } from '../ContextProvider';
import { useRouter } from 'next/router';
import { requireAuth } from '../utils/supabase/requireAuth';


const AppContent = () => {
  const {isBelowTablet,chatCache,setChatCache, mobileClient, session, pageState, setPageState, pageSTATES, scramble,inputBarWrapRef,userInput, placeholder} = useGeneralContext();
  const pageRef = useRef(null);
  const appRef = useRef(null);
  const [isMobileClient, setMobileIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { id } = router.query;
    if (id && session && chatCache ) {

        
    } else {
      // setChatCache(null);
    }
  }, [router.query, chatCache, session]);



  useEffect(() => {
    setMobileIsClient(mobileClient);
  }, [mobileClient]);

   useEffect(() => {
     const updatePadding = () => {
        if(inputBarWrapRef.current) {
          const inputBarHeight = inputBarWrapRef.current.offsetHeight;
          document.documentElement.style.setProperty('--page-padding-bottom', `${inputBarHeight}px`);
        }
     };
     
     const interval = setInterval(updatePadding, 50); 
   
     return () => clearInterval(interval);
   }, [isMobileClient, placeholder, userInput, scramble, router.query]);


  useEffect(() => {
    setPageState(pageSTATES.AGENT);
  }, []);


  return (
    <div className="App" ref={appRef}>
       <TopBarMobile />
      
      <div ref={ pageRef } className="pagecontent" >
        < AgentChat/>
      </div>
      <InputBarMobile />
     
   
    </div>
  );
};

const HomePage = ({ session  }) => {
  const { setSession } = useGeneralContext();

  useEffect(() => {
    if ( session ) {
      console.log( session  );
      setSession(session );
    }
  }, [session, setSession]);

  return <AppContent />;
};

export async function getServerSideProps(context) {
  const authResponse = await requireAuth(context);

  if (authResponse.redirect) {
    return authResponse;
  }

  return {
    props: {
     session: authResponse,
    },
  };
}

export default HomePage;