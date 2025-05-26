import React, {useRef, useState, useEffect } from 'react';
import InputBar from '../components/barmenu/InputBar';
import TopBar from '../components/barmenu/TopBar';
import InputBarMobile from '../components/barmenu/InputBarMobile';
import TopBarMobile from '../components/barmenu/TopBarMobile';
import SettingsMenu from '../components/view/Settings_Menu';
import { useGeneralContext } from '../ContextProvider';
import { useRouter } from 'next/router';
import NavSettings from '../components/view/Nav_Settings';
import { requireAuth } from '../utils/supabase/requireAuth';

const AppContent = () => {
  const {isBelowTablet, mobileClient, session, setPageState, pageSTATES, scramble,inputBarWrapRef,userInput, placeholder, activeTab} = useGeneralContext();
  const pageRef = useRef(null);
  const appRef = useRef(null);
  const router = useRouter();
  const [isMobileClient, setMobileIsClient] = useState(false);

  useEffect(() => {
    setMobileIsClient(mobileClient);
  }, [mobileClient]);
  
  useEffect(() => {
    if (pageRef.current) {
      document.documentElement.style.setProperty('--page-padding-bottom', `0px`);
    }
  }, [isMobileClient]);

  useEffect(() => {
    if (router.query.page) {

      const foundPage = Object.values(pageSTATES).find( ( pageObj ) => pageObj.id === router.query.page );

      if (foundPage)  setPageState(foundPage);
      else  setPageState(pageSTATES.SETTINGS);
    
    } else setPageState(pageSTATES.SETTINGS);

  }, [router.query]);

  return (
    <div className="App" ref={appRef}>
      {!isMobileClient && !isBelowTablet ?  (
        <>
          <TopBar />
          <div className="navigation-menu">
           <div className="navigation-tabs"><NavSettings /> </div>
            <div className="navigation-view">
              <div ref={pageRef} className= "pagecontentwithnavmenu" >
              <SettingsMenu />
              </div>
            </div>
          </div>
        </>
      ) : ( router.query.page ?

        <>
          <TopBarMobile />
          <div ref={pageRef} className="pagecontent">
          <SettingsMenu />
          </div>
        </>
        : 
        <>
          <TopBarMobile/>
          <div ref={ pageRef } className="pagecontent" >
          <NavSettings />

          </div>
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