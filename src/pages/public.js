import React, { useRef, useState, useEffect } from 'react';
import InputBar from '../components/barmenu/InputBar';
import TopBar from '../components/barmenu/TopBar';
import TileMenu from '../components/view/Tile_Menu';
import { useGeneralContext } from '../ContextProvider';
import { useRouter } from 'next/router';
import NavPublic from '../components/view/Nav_Public';
import TopBarMobile from '@/components/barmenu/TopBarMobile';
import InputBarMobile from '@/components/barmenu/InputBarMobile';
const AppContent = () => {

  const {isBelowTablet, mobileClient, session, setPageState, pageSTATES, scramble, inputBarWrapRef, userInput, 
    placeholder, setOpenRev, publicRevCache, reverieData, setReverieData, ReverieManager } = useGeneralContext();

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
    const { id } = router.query;
    if (id && session && publicRevCache ) {
        const reverie = publicRevCache.find((card) => card.id === id);
        if(reverie) setReverieData( reverie);
    } else {
      setReverieData(null);
    }
  }, [router.query, publicRevCache, session]);

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

    if(router.query.id) setPageState(pageSTATES.PUBLIC_REVERIE); else setPageState(pageSTATES.PUBLIC)
    const { id } = router.query;
    if (id) {
      setOpenRev(id);
      fetchReverieData(id);
    }
  }, [router.query]);

 
  
  return (
    <div className="App" ref={appRef}>
      {!isMobileClient && !isBelowTablet ?  (
        <>
          <TopBar />
          <div className="navigation-menu">
           <div className="navigation-tabs"><NavPublic /> </div>
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
          <NavPublic />

          </div>
          <InputBarMobile />
        </>
       )
      
      }
    </div>
  );
};

const HomePage = () => <AppContent />;

export default HomePage;