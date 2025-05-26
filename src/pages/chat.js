import React, {useRef, useState, useEffect } from 'react';
import InputBar from '../components/barmenu/InputBar';
import TopBar from '../components/barmenu/TopBar';
import InputBarMobile from '../components/barmenu/InputBarMobile';
import TopBarMobile from '../components/barmenu/TopBarMobile';
import NavChat from '../components/view/Nav_Chat';
import UserChat from '../components/view/UserChat';
import { useGeneralContext } from '../ContextProvider';
import { useRouter } from 'next/router';
import { requireAuth } from '../utils/supabase/requireAuth';

const AppContent = () => {
  const { isBelowTablet,chatCache,setChatCache, mobileClient, session, pageState, setPageState, pageSTATES, scramble,inputBarWrapRef,userInput, placeholder} = useGeneralContext();
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
    setPageState(pageSTATES.CHAT);
  }, []);

  return (
    <div className="App" ref={appRef}>
      { !isMobileClient && !isBelowTablet ?  (
        <>
          <TopBar />
          <div className="navigation-menu">
           <div className="navigation-tabs"><NavChat /> </div>
            <div className="navigation-view">
              <div ref={pageRef} className= "pagecontentwithnavmenu" >
                <UserChat />
              </div>
              <InputBar />
            </div>
          </div>
        </>
      ) : ( router.query.id ?

        <>
          <TopBarMobile />
          <div ref={pageRef} className="pagecontent">
            <UserChat />
          </div>
          <InputBarMobile />
        </>
        : 
        <>
          <TopBarMobile/>
          <div ref={ pageRef } className="pagecontent" >
          <NavChat />

          </div>
          <InputBarMobile />
        </>
       )
      
      }
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