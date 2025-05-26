// ContextProvider.js
'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import * as atoms from './utils/client/atoms';
import ReverieManager from './utils/reverieManager';
import { supabase } from './utils/supabase/client';
import { useRouter } from 'next/router';

const GeneralContext = createContext();

export function ContextProvider({ children }) {
  const router = useRouter();
  
  const [mobileClient] = useAtom(atoms.mobileClientAtom);
  const [userInput, setUserInput] = useAtom(atoms.userInputAtom);
  const [processing, setProcessing] = useAtom(atoms.processingAtom);
  const [openRev, setOpenRev] = useAtom(atoms.openRevAtom);
  const [revCache, setRevCache] = useAtom(atoms.revCacheAtom);
  const [publicRevCache, setPublicRevCache] = useAtom(atoms.publicRevCacheAtom);
  const [pageState, setPageState] = useAtom(atoms.pageStateAtom);
  const [session, setSession] = useAtom(atoms.sessionAtom);
  const [scramble, setScramble] = useAtom(atoms.scrambleAtom);
  const [placeholder, setPlaceholder] = useAtom(atoms.placeholderAtom);
  const [userData, setUserData] = useAtom(atoms.userDataAtom);
  const [topbarDelete, setTopbarDelete] = useAtom(atoms.topbarDeleteAtom);
  const [reverieData, setReverieData] = useAtom(atoms.reverieDataAtom);
  const [allUsers, setAllUsers] = useAtom(atoms.allUsersAtom);
  const [activeTab, setActiveTab] = useAtom(atoms.activeTabAtom);
  const [createCardId, setCreateCardId] = useAtom(atoms.newCardIdAtom);
  const [chatCache, setChatCache] = useAtom(atoms.chatCacheAtom);
  const [isBelowTablet, setIsBelowTablet] = useAtom(atoms.isBelowTabletAtom);
  const [userInsights, setUserInsights] = useAtom(atoms.userInsightsAtom);
  const [suggestions, setSuggestions] = useAtom(atoms.suggestionsAtom);
  const [suggestionsActive, setSuggestionsActive] = useAtom(atoms.suggestionsActiveAtom);
  const [chatStatus, setChatStatus] = useAtom(atoms.chatStatusAtom);

  const pageSTATES  = atoms.pageStates;

  const [chatHistory, setChatHistory] = useState([]);
  const [stripeCustomer, setStripeCustomer] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [chatUpdatePing, setChatUpdatePing] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);


  const reverieSubscriptionRef = useRef(null);
  const chatSubscriptionRef = useRef(null);
  const insightSubscriptionRef = useRef(null);
  const chatScrollRef = useRef(null);
  const inputBarWrapRef = useRef(null);
  const autoScrollingRef = useRef(false);


//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |    EXTRANEOS UPDATES     |
//-----------------------------------------|__________________________|---------------------------------------------------------------

useEffect(() => {    
  if(session && session !== 0 ) supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

}, [session]);


  useEffect(() => {
    const handleResize = () => {
      setIsBelowTablet(window.innerWidth < 640 );
    };
    window.addEventListener('resize', handleResize);
    handleResize();
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |    SCROLL - FUNCTIONS    |
//-----------------------------------------|__________________________|---------------------------------------------------------------

useEffect(() => {
  if (chatScrollRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    if(scrollTop + clientHeight >= scrollHeight - 100){
       scrollChatToBottom();
       setIsAtBottom(true);
      }
   
  }
}, [chatCache, suggestions, suggestionsActive, scramble]);

  const checkScrollPosition = () => {

    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight -20);
    }
  
  };

  const scrollChatToBottom = (smooth = false) => {
    if (!chatScrollRef.current) return;
    autoScrollingRef.current = true;
    
    chatScrollRef.current.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    

  };

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |    SESSION & AUTH        |
//-----------------------------------------|__________________________|---------------------------------------------------------------
  

useEffect(() => {

  if (!navigator.onLine) {
    setSession(0);
    console.error('No internet connection.');
    return;
  }

  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    
    if (event === 'INITIAL_SESSION') {
      console.log('Starting subscriptions',event, session);
      if(session) startSubscribeAllCards();
      if(session) startSubscribeAllChat(session.user.id);
      if(session) startSubscribeAllInsights();
    } else if (event === 'SIGNED_IN') {
      // console.log('User signed in.', event, session);
      if(reverieSubscriptionRef.current === null ) startSubscribeAllCards();
      if(chatSubscriptionRef.current === null) startSubscribeAllChat(session.user.id);
      if(insightSubscriptionRef.current === null) startSubscribeAllInsights();
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Access token refreshed. Ensuring subscriptions are active...', event, session);
      startSubscribeAllCards();
      startSubscribeAllChat(session.user.id);
      startSubscribeAllInsights();
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out. Stopping subscriptions...', event, session);
      stopSubscribeAllCards();
      stopSubscribeAllChat();
      stopSubscribeAllInsights();
    }
  });

  return () => {
    // console.log('Cleaning up auth listeners...');
    stopSubscribeAllCards();
    stopSubscribeAllChat();
    stopSubscribeAllInsights();
  };
}, []);



//-----------------------------------------|                                          |---------------------------------------------------------------------------
//                                         |     SESSION START - DATA POPULATION      |
//-----------------------------------------|__________________________________________|---------------------------------------------------------------
  useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        const [
          userCards,
          publicCards,
          chat,
          userData,
          insights,
          users
        ] = await Promise.all([
          ReverieManager.fetchAllUserCards(),
          ReverieManager.fetchAllPublicCards(),
          ReverieManager.fetchAllChat(),
          ReverieManager.getUserData(),
          ReverieManager.fetchAllUserInsights(),
          ReverieManager.fetchAllUsers()
        ]);

        setRevCache(userCards);
        setPublicRevCache(publicCards);
        setChatCache(chat);
        setUserData(userData);
        setUserInsights(insights);
        setAllUsers(users);
      } catch (err) {
        console.error('[bootstrap]', err);
      }
    })();
  }, [session, setRevCache, setPublicRevCache, setChatCache]);

  useEffect(() => {
    const createNextCard = async () => {
      if (!createCardId && session?.user?.id) {
        try {
          console.log('Create Card try');
          const nextReverie = await ReverieManager.addCard({score: -1});
          if (nextReverie) {
            console.log('CreateSuccess');
            setCreateCardId(nextReverie);
          }
        } catch (err) {
          console.error('Failed to create new card:', err);
        }
      }
    };
    if(session) {
    createNextCard();
    }
  }, [session]);

//-----------------------------------------|                                          |---------------------------------------------------------------------------
//                                         |  REALTIME - SUBSCRIBE ALL USER INSIGHTS  |
//-----------------------------------------|__________________________________________|---------------------------------------------------------------

useEffect(() => {
  if (insightSubscriptionRef.current) {
    const channel = insightSubscriptionRef.current;

    const statusListener = (status) => {
      // console.log('Channel status changed:', status);
    };

    channel.on('status', statusListener);

    return () => {
      // console.log('Cleaning up status listener...');
    };
  } else {
    // console.warn('insightSubscriptionRef.current is null or undefined. Cannot attach event listener.');
  }
}, [insightSubscriptionRef.current]); 

const retrySubscribeAllInsights = () => {
  if (navigator.onLine) {
    // console.log('User is back online. Retrying subscription to user_insights table...');
    startSubscribeAllInsights();
    window.removeEventListener('online', retrySubscribeAllInsights);
  }
};

const startSubscribeAllInsights = async () => {
  try {
    if (insightSubscriptionRef.current) {
      await insightSubscriptionRef.current.unsubscribe();
      supabase.removeChannel(insightSubscriptionRef.current);
      insightSubscriptionRef.current = null;
    }

    if (!navigator.onLine) {
      console.warn('Client is offline. Waiting for online event to retry subscription.');
      window.addEventListener('online', retrySubscribeAllInsights);
      return;
    }

    const channel = supabase
      .channel('user_insights')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_insights' },
        async (payload) => {
          const { eventType } = payload; 
          const updatedInsight = payload.new; 
          const deletedInsight = payload.old;

          switch (eventType) {
            case 'INSERT':
              // console.log('Realtime  INSERT from user_insights:', updatedInsight);
              setUserInsights((prevInsights) => {
                const updatedInsights = [...prevInsights];
                updatedInsights.push(updatedInsight);
                return updatedInsights;
              });
              
              break;
            case 'UPDATE': {

              // console.log('Realtime UPDATE from user_insights:', updatedInsight, userInsights);

              setUserInsights((prevInsights) => {
                const updatedInsights = [...prevInsights];
                const idx = prevInsights.findIndex((insight) => insight.id === updatedInsight.id);
                
                if (idx !== -1) {
                  // console.log( "updating existing insight");
                  updatedInsights[idx] = {
                    ...updatedInsights[idx],
                    ...updatedInsight,
                  };
                } else {
                  
                  updatedInsights.push(updatedInsight);
                }
                return updatedInsights;
              });
              break;
            }

            case 'DELETE': {
              // console.log('Realtime DELETE from user_insights:', deletedInsight);
              setUserInsights((prevInsights) =>
                prevInsights.filter((insight) => insight.id !== deletedInsight.id)
              );
              break;
            }

            default:
              console.warn('Unhandled event type in user_insights:', eventType);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // console.log('Successfully subscribed to insights changes.');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred in insights. Stopping retry attempts.');
        } else if (status === 'CLOSED') {
          console.error('Subscription closed unexpectedly in insights. No retries will be attempted.');
        } else {
          console.warn('Unhandled subscription status in insights:', status);
        }
      });

    insightSubscriptionRef.current = channel;
  } catch (error) {
    console.error('Error while setting up Realtime subscription:', error);
    alert('Error occurred during subscription setup. Please check the console for details.');
  }
};

const stopSubscribeAllInsights = async () => {
  try {
    if (insightSubscriptionRef.current) {
      // console.log('Stopping Realtime subscription for user_insights table...');
      await insightSubscriptionRef.current.unsubscribe();
      supabase.removeChannel(insightSubscriptionRef.current);
      insightSubscriptionRef.current = null;
    }
    window.removeEventListener('online', retrySubscribeAllInsights );
  } catch (error) {
    console.error('Error while stopping Realtime subscription:', error);
  }
};

//-----------------------------------------|                                          |---------------------------------------------------------------------------
//                                         |   REALTIME - SUBSCRIBE ALL CARDS         |
//-----------------------------------------|__________________________________________|---------------------------------------------------------------
useEffect(() => {
  if (reverieSubscriptionRef.current) {
    const channel = reverieSubscriptionRef.current;

    const statusListener = (status) => {
      // console.log('Channel status changed:', status);
    };

    channel.on('status', statusListener);

    return () => {
      // console.log('Cleaning up status listener...');
    };
  } else {
    // console.warn('reverieSubscriptionRef.current is null or undefined. Cannot attach event listener.');
  }
}, [reverieSubscriptionRef.current]); 

const retrySubscribeAllCards = () => {
  if (navigator.onLine) {
    // console.log('User is back online. Retrying subscription to revcards table...');
    startSubscribeAllCards();
    window.removeEventListener('online', retrySubscribeAllCards);
  }
};

const startSubscribeAllCards = async () => {
  try {
    if (reverieSubscriptionRef.current) {
      await reverieSubscriptionRef.current.unsubscribe();
      supabase.removeChannel(reverieSubscriptionRef.current);
      reverieSubscriptionRef.current = null;
    }

    if (!navigator.onLine) {
      console.warn('Client is offline. Waiting for online event to retry subscription.');
      window.addEventListener('online', retrySubscribeAllCards);
      return;
    }

    const channel = supabase
      .channel('revcards')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'revcards' },
        async (payload) => {
          const { eventType } = payload; 
          const updatedReverie = payload.new; 
          const deletedReverie = payload.old;

          switch (eventType) {
            case 'INSERT':
            case 'UPDATE': {

              console.log('Realtime UPDATE or INSERT from revcards:', updatedReverie);

              const retrievedData = await ReverieManager.getReverieDataById(updatedReverie.id);

              if(retrievedData.access_level !== 'OWNER') break;

              setRevCache((prevCache) => {
                const updatedCache = [...prevCache];
                const idx = updatedCache.findIndex((rev) => rev.id === updatedReverie.id);

                if (idx !== -1) {
                  if (
                    updatedCache[idx].version === null ||
                    retrievedData.version > (updatedCache[idx].version ?? 0)
                  ) {
                    updatedCache[idx] = {
                      ...updatedCache[idx],
                      ...retrievedData,
                    };
                  }
                } else {
                  // Not in cache yet, so it's new
                  updatedCache.push({ ...updatedReverie, ...retrievedData });
                }
                return updatedCache.sort((a, b) => b.order_index - a.order_index);
              });

              // If we happen to have the reverie open, also update local state if versions line up
              if (updatedReverie.id === openRev) {
                setReverieData((prevReverieData) => {
                  if (openRev === updatedReverie.id) {
                    // Optionally compare versions here as well if needed
                    return { ...prevReverieData, ...updatedReverie };
                  }
                  return prevReverieData;
                });
              }

              if (updatedReverie && updatedReverie.id) {
                setChatCache((prevCache) => {
                  return prevCache.map((userObj) => {
                    const updatedChats = userObj.chats.map((chatItem) => {
                      if (chatItem.revcard_id === updatedReverie.id) {
                        if(
                          chatItem.card_name === "Reflecting..." &&
                          updatedReverie.title !== "Reflecting..."
                        ) {
                        }
                        return {
                          ...chatItem,
                          card_name: updatedReverie.title, 
                        };
                      }
                      return chatItem;
                    });

                    return {
                      ...userObj,
                      chats: updatedChats,
                    };
                  });
                });
              }
              break;
            }

            case 'DELETE': {
              // console.log('Realtime DELETE from revcards:', deletedReverie);
              setRevCache((prevCache) =>
                prevCache.filter((rev) => rev.id !== deletedReverie.id)
              );
              break;
            }

            default:
              console.warn('Unhandled event type in revcards:', eventType);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // console.log('Successfully subscribed to revcards changes.');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred in revcards. Stopping retry attempts.');
        } else if (status === 'CLOSED') {
          console.error('Subscription closed unexpectedly in revcards. No retries will be attempted.');
        } else {
          console.warn('Unhandled subscription status in revcards:', status);
        }
      });

    reverieSubscriptionRef.current = channel;
  } catch (error) {
    console.error('Error while setting up Realtime subscription:', error);
    alert('Error occurred during subscription setup. Please check the console for details.');
  }
};


const stopSubscribeAllCards = async () => {
  try {
    if (reverieSubscriptionRef.current) {
      // console.log('Stopping Realtime subscription for revcards table...');
      await reverieSubscriptionRef.current.unsubscribe();
      supabase.removeChannel(reverieSubscriptionRef.current);
      reverieSubscriptionRef.current = null;
    }
    window.removeEventListener('online', retrySubscribeAllCards);
  } catch (error) {
    console.error('Error while stopping Realtime subscription:', error);
  }
};
//-----------------------------------------|                                          |---------------------------------------------------------------------------
//                                         |   REALTIME - SUBSCRIBE ALL CHAT          |
//-----------------------------------------|__________________________________________|---------------------------------------------------------------
useEffect(() => {
  
  if (chatSubscriptionRef.current) {
    const channel = chatSubscriptionRef.current;

    const statusListener = (status) => {
      // console.log('Channel status changed:', status);
    };

    channel.on('status', statusListener);

    return () => {
      // console.log('Cleaning up status listener...');
    };
  } else {
    // console.warn('reverieSubscriptionRef.current is null or undefined. Cannot attach event listener.');
  }
}, [chatSubscriptionRef.current]); 

  const retrySubscribeAllChat = () => {
    if (navigator.onLine) {
      // console.log('User is back online. Retrying subscription...');
      startSubscribeAllChat(session?.user?.id);
      window.removeEventListener('online', retrySubscribeAllChat); 
    }
  };
  const startSubscribeAllChat = async (userId) => {
  try {
    if (chatSubscriptionRef.current) {
      await chatSubscriptionRef.current.unsubscribe();
      supabase.removeChannel(chatSubscriptionRef.current);
      chatSubscriptionRef.current = null;
    }

    if (!navigator.onLine) {
      console.warn('Client is offline. Waiting for online event to retry subscription.');
      window.addEventListener('online', retrySubscribeAllChat);
      return;
    }

    const channel = supabase
      .channel('chat')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat' },
          async (payload) => {
            const { eventType } = payload; 
            const newChat = payload.new;

            switch (eventType) {
              case 'INSERT':{
                  
                // console.log('Realtime INSERT received from chat table:', newChat,session);
                if(isAtBottom) ReverieManager.updateChat(newChat.id, {viewed:true});
                let otherUserId = null;
                if (newChat.user_id === userId) {
                  otherUserId = newChat.receiver_id;
                } else if (newChat.receiver_id === userId) {
                  otherUserId = newChat.user_id;
                }
            
                const isAgent = !otherUserId;
                const userKey = isAgent ? null : otherUserId;

                setChatCache((prevHistory) => {
                  if (Array.isArray(prevHistory)) {
                  const updatedHistory = [...prevHistory];
                  let userIndex = updatedHistory.findIndex((u) => u.id === userKey);
                  // console.log(userIndex);
                  if (userIndex === -1) {
                    updatedHistory.push({
                      id: userKey,
                      chats: []
                    });
                    userIndex = updatedHistory.length - 1;
                  }
            
                  const newMessage = {
                    id: newChat.id,
                    text: newChat.text,
                    suggestions: newChat.suggestions,
                    created_at: newChat.created_at,
                    revcard_id: newChat.revcard_id,
                    clarification:newChat.clarification,
                    viewed:newChat.viewed,
                    user: isAgent? newChat.user : newChat.user_id === userId
                  };
                  if(router.query.id === userKey || ( router.query.id === undefined&& userKey===null) ) setChatUpdatePing((prevPing) => prevPing + 1);
                  updatedHistory[userIndex].chats.push(newMessage);
            
                  return updatedHistory;
                  }  else {
                 setChatCache([{ "id" : userKey, "chats":[{...newChat }]  }]);
                 
                  }
                  if (chatScrollRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
                    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 100);
                    if (scrollTop + clientHeight >= scrollHeight - 100 === false) console.log( "checking position and false");
                  }
                  if( isAtBottom ) scrollChatToBottom();
                  });
                break;
            }
              case 'UPDATE': {
                  
                  // console.log('Realtime update received from chat table:', newChat,session);

                  let otherUserId = null;
                  if (newChat.user_id === userId) {
                    otherUserId = newChat.receiver_id;
                  } else if (newChat.receiver_id === userId) {
                    otherUserId = newChat.user_id;
                  }
              
                  const isAgent = !otherUserId;
                  const userKey = isAgent ? null : otherUserId;
              
                  setChatCache((prevHistory) => {
                    const updatedHistory = [...prevHistory];
                    let userIndex = updatedHistory.findIndex((u) => u.id === userKey);

                    if (userIndex === -1) {
                      updatedHistory.push({
                        id: userKey,
                        chats: []
                      });
                      userIndex = updatedHistory.length - 1;
                    }
                  

                    const updatedMessage = {
                      id: newChat.id,
                      text: newChat.text,
                      suggestions:newChat.suggestions,
                      created_at: newChat.created_at,
                      revcard_id: newChat.revcard_id,
                      clarification:newChat.clarification,
                      viewed:newChat.viewed,
                      user: isAgent ? newChat.user : newChat.user_id === userId
                    };
                  
                    const existingMsgIndex = updatedHistory[userIndex].chats.findIndex(
                      (c) => c.id === newChat.id
                    );
                  
                    if (existingMsgIndex !== -1) {
                      updatedHistory[userIndex].chats[existingMsgIndex] = {
                        ...updatedHistory[userIndex].chats[existingMsgIndex],
                        ...updatedMessage
                      };
                    } else {
                      updatedHistory[userIndex].chats.push(updatedMessage);
                    }
                  
                    if (
                      router.query.id === userKey ||
                      (router.query.id === undefined && userKey === null)
                    ) {
                      setChatUpdatePing((prevPing) => prevPing + 1);
                    }
                    if(isAtBottom) scrollChatToBottom();
                    return updatedHistory;
                  });
                  break;
              }
              default:
                console.warn('Unhandled event type in chat:', eventType);
                break;
                
            }
          }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // console.log('Successfully subscribed to chat changes.');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred in chat. Stopping retry attempts.');
        } else if (status === 'CLOSED') {
          console.error('Subscription closed unexpectedly in Chat. No retries will be attempted for chat.');
         
        } else {
          console.warn('Unhandled subscription status in Chat:', status);
        }
      });

    chatSubscriptionRef.current = channel;

      } catch (error) {
    console.error('Error while setting up Realtime subscription fro chat:', error);
    alert('Error occurred during subscription setup for Chat. Please check the console for details.');
  }
};
  const stopSubscribeAllChat = async () => {
    try {
      if (chatSubscriptionRef.current) {
        // console.log('Stopping Realtime subscription for chat table...');
        await chatSubscriptionRef.current.unsubscribe();
        supabase.removeChannel(chatSubscriptionRef.current);
        chatSubscriptionRef.current = null;
      }
      window.removeEventListener('online', retrySubscribeAllChat);
    } catch (error) {
      console.error('Error while stopping Realtime subscription for chat:', error);
    }
  };

  return (
    <GeneralContext.Provider value={{ setRevCache, revCache, userInput, setUserInput, userData, setUserData, userInsights, setUserInsights,
      subscriptions, setSubscriptions, paymentMethod, setPaymentMethod, reverieData, setReverieData, suggestions, setSuggestions,
      pageState, pageSTATES, setPageState, openRev, setOpenRev, chatUpdatePing, setChatUpdatePing, createCardId, setCreateCardId,
      mobileClient, ReverieManager, activeTab, setActiveTab, suggestionsActive , setSuggestionsActive,
      session, processing, setProcessing, inputBarWrapRef, placeholder,  publicRevCache, setPublicRevCache, chatScrollRef, scrollChatToBottom,
       setPlaceholder, scramble, setScramble, topbarDelete, setTopbarDelete, stripeCustomer, setStripeCustomer,
      chatCache, setChatCache, setSession,  chatHistory, setChatHistory, allUsers, setAllUsers, isBelowTablet,
       setIsBelowTablet, isAtBottom, setIsAtBottom, checkScrollPosition, chatStatus, setChatStatus, autoScrollingRef
    }}>
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneralContext = () => useContext(GeneralContext);