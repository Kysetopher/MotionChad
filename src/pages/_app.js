// _app.js (simplified)
import { ContextProvider } from '../ContextProvider';
import Head from 'next/head';
import { useRef, useEffect, createContext, useContext } from 'react';
import { DndProvider } from 'react-dnd'; 
import { HTML5Backend } from 'react-dnd-html5-backend'; 
import '../styles/App.css';

const AppContext = createContext({});
export const useAppContext = () => useContext(AppContext);

function MyApp({ Component, pageProps }) {
  const appRef = useRef(null);

  useEffect(() => { // determines hieght of bottom bar on mobile browsers and sets css variable accordingly
    if (appRef.current) {

      const rootElement = document.documentElement;
      const bottomBarHeight =  appRef.current.clientHeight - window.innerHeight;
      rootElement.style.setProperty('--browser-bottom-bar-height', `${bottomBarHeight}px`);
    }
  }, []);

  useEffect(() => { // determines hieght for space below keyboards on mobile browsers and sets css variable accordingly

    if (typeof window !== 'undefined' && navigator?.virtualKeyboard) { 
      
      const handleGeometryChange = (event) => {

        const { height } = event.target.boundingRect;
        document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
        rootElement.style.setProperty('--browser-bottom-bar-height', `0px`);  

      };

      navigator.virtualKeyboard.addEventListener('geometrychange', handleGeometryChange);
      return () => {
        navigator.virtualKeyboard.removeEventListener('geometrychange', handleGeometryChange);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode = () => {
        return (
          window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone || 
          document.referrer.includes('android-app://')
        );
      };

      if (navigator.virtualKeyboard) {
        navigator.virtualKeyboard.overlaysContent = isStandaloneMode();
      }
    }
  }, []);


  return (
    <DndProvider backend={HTML5Backend}>
      <AppContext.Provider value={{}}>
        <ContextProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="mobile-web-app-capable" content="yes" />
            <link rel="manifest" href="/manifest.json" />
          </Head>
          <div ref={appRef} className="appContainer">
            <Component {...pageProps} />
          </div>
        </ContextProvider>
      </AppContext.Provider>
    </DndProvider>
  );
}

export default MyApp;
