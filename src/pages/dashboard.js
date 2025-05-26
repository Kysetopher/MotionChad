import React, { useRef, useState, useEffect } from 'react';
import InputBar from '../components/barmenu/InputBar';
import TopBar from '../components/barmenu/TopBar';
import TileMenu from '../components/view/Tile_Menu';
import { useGeneralContext } from '../ContextProvider';
import { useRouter } from 'next/router';
import NavDashboard from '../components/view/Nav_Dashboard';
import TopBarMobile from '@/components/barmenu/TopBarMobile';
import InputBarMobile from '@/components/barmenu/InputBarMobile';
import { requireAuth } from '../utils/supabase/requireAuth';


const AppContent = () => {

  const {isBelowTablet, mobileClient, session, setPageState, pageSTATES, scramble, inputBarWrapRef, userInput, 
    placeholder, setOpenRev, revCache, reverieData, setReverieData, ReverieManager } = useGeneralContext();

  const pageRef = useRef(null);
  const appRef = useRef(null);
  const router = useRouter();
  const [isMobileClient, setMobileIsClient] = useState(false);

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
    const { id } = router.query;
    if (id && session && revCache ) {
        const reverie = revCache.find((card) => card.id === id);
        if(reverie) setReverieData( reverie);
    } 
  }, [router.query, revCache, session]);

  useEffect(() => {
    const { id } = router.query;
    if (!id )  setReverieData(null);
  }, [router.query]);
  
  useEffect(() => {
    const fetchReverieData = async (id) => {
      try {
          const reverie = await ReverieManager.getReverieDataById(id);
          if (reverieData === null) {
              setReverieData(reverie);
          }
      } catch (error) {
          console.error("Error fetching reverie data:", error);
      }
  };

    if(router.query.id) setPageState(pageSTATES.REVERIE); else setPageState(pageSTATES.DASHBOARD)
    const { id } = router.query;
    if (id) {
      setOpenRev(id);
      fetchReverieData(id);
    } else setOpenRev(null);
  }, [router.query]);

  return (
    <div className="App" ref={appRef}>
      {!isMobileClient && !isBelowTablet ?  (
        <>
          <TopBar />
          <div className="navigation-menu">
          <div className="navigation-tabs"> <NavDashboard /> </div>
            <div className="navigation-view">
              <div ref={pageRef} className= "pagecontentwithnavmenu" >
                <TileMenu reverie={reverieData} />
              </div>
              <InputBar />
            </div>
          </div>
        </>
      ) : ( router.query.id ?

        <>
          <TopBarMobile />
          <div ref={pageRef} className="pagecontent">
            <TileMenu reverie={reverieData} />
          </div>
          <InputBarMobile />
        </>
        : 
        <>
          <TopBarMobile/>
          <div ref={ pageRef } className="pagecontent" >
          <NavDashboard />

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