import React, {useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import { useRouter } from 'next/router';


function SettingsButton() {
    const { pageState, mobileClient } = useGeneralContext();
    const router = useRouter();

    const handleClick = () => {
      if(mobileClient) router.push('/settings');
      else router.push({
        pathname: '/settings',
        query: { page: "memory" },
      });
    };
  
    return (
      <div
        onClick={handleClick}
        tabIndex={0}
        className="topbar-right-button"
      >
        <img
          className={`topbar-img ${
            (pageState.tab === 'membership' || pageState.tab === 'settings' || pageState.tab === 'profile' || pageState.tab === 'memory') ? 'selected' : ''
          }`}
          src="/icon/heyjinn-dark.svg"
          alt="settings-icon"
        />
      </div>
    );
  }
function HomeButton() {
    const { pageState } = useGeneralContext();
    const router = useRouter();
    return (
        <div 
        onClick={() => router.push("/login")} 
        tabIndex={0} className="topbar-right-button">
        <img className={`topbar-img ${ (pageState.tab === "home" || pageState.tab === "login")  ? 'selected' : ''}`} src="/icon/heyjinn-dark.svg"  alt="delete-reverie-img" />
        </div>
       
    );
}

function NavigationTabs() {
    const { openRev, session, pageState, pageSTATES, ReverieManager, isBelowTablet } = useGeneralContext();
    const router = useRouter();

    const navigationTabs = [
        {
            page: pageSTATES.AGENT,
            route: '/agent',
            icon: '/icon/flame.svg',
            alt: 'Chat',
        },
        {
            page: pageSTATES.DASHBOARD,
            route: '/dashboard',
            icon: '/icon/dashboard.svg',
            alt: 'Dashboard',
        }
    ];

    if (session === -1) return <></>;

    return (
        <div className="topbar-left-button">
            {navigationTabs.map((tab, index) => {
                const isDashboardSpecialCase =
                    tab.page === pageSTATES.DASHBOARD &&
                    isBelowTablet &&
                    pageState.id === "dashboard";

                const handleClick = async () => {
                    if (isDashboardSpecialCase) {

                        const cardId = await ReverieManager.addCard({
                            title: "New Card",
                            plate: [{ type: 'p', children: [{ text: "" }] }],
                        });

                        await router.push({
                            pathname: '/dashboard',
                            query: { id: cardId },
                        });

                    } else {
                        await router.push(tab.route);
                    }
                };

                const iconSrc =
                    tab.page === pageSTATES.DASHBOARD &&
                    ((pageState.tab === "dashboard" && openRev) || isDashboardSpecialCase)
                        ? "./icon/plus.svg"
                        : tab.icon;

                return (
                    <img
                        key={index}
                        className={`topbar-img ${pageState.tab === tab.page.tab ? 'selected' : ''}`}
                        src={iconSrc}
                        alt={tab.alt}
                        onClick={handleClick}
                    />
                );
            })}
        </div>
    );
}



function DeleteRevpage() {
    const {setRevCache, revCache, openRev, ReverieManager, topbarDelete, setTopbarDelete } = useGeneralContext();
    const router = useRouter();

    const handleDeleteReverie = async () => {
        if(topbarDelete){
            setTopbarDelete(false);
        const success = await ReverieManager.deleteReverie(openRev);
        if (success) {
            setRevCache(revCache.filter(card => card.id !== openRev));
            router.push('/');
        }} else setTopbarDelete(true);
    };
    useEffect(() => {
        const handleBeforeUnload = async (event) => {
            setTopbarDelete(false);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handleBeforeUnload);
        };
    }, []);

    return (
        <div onClick={handleDeleteReverie} onBlur={() => setTopbarDelete(false)} tabIndex={0} className="topbar-right-button">
            <img className="delete-reverie-img" src="/icon/delete-cross.svg"  alt="delete-reverie-img" />
        </div>
    );
}


function NavigationPyramid() {
    const {pageSTATES,pageState,setPageState } = useGeneralContext();
    const router = useRouter();

    const handleKeyPress = async (e) => {
        router.back();
    };
 
    if(pageState.id === pageState.tab) return null;

    return (
        <div className='top-menu-back'>
            <div onClick={handleKeyPress} className='back-arrow'>
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                >
                    <path d="M12 24L0 0h24L12 24z" />
                </svg>
            </div>
        </div>
    );
}

export {SettingsButton, DeleteRevpage,  NavigationPyramid , NavigationTabs, HomeButton};