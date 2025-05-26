import React, { useEffect, useRef, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import { useRouter } from 'next/router';
import '../../styles/chat.css';
import {ChatSplash} from '../items/Splash';

const UserChat = () => {
  const {scramble , chatUpdatePing,placeholder, setChatUpdatePing, setChatHistory,chatCache, userInput, mobileClient, chatHistory ,  setChatCache} = useGeneralContext();
  const [isHydrated, setIsHydrated] = React.useState(false);
  const chatScrollContainerRef = useRef(null);
  const [ scroll, setScroll ] = useState(false);
  const [dots, setDots] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true); // Mark that the component has hydrated
  }, []);


  useEffect(() => {
   if(chatCache.length>0){
    console.log("CHATCACHE",chatCache);
    const chatgroup = chatCache.find(item => item.id === router.query.id )
    console.log("CHATGROUP",chatgroup);
    if(chatgroup) {
      setChatHistory(chatgroup.chats);

    } else setChatHistory([]);
  }
  }, [chatCache, router.query.id]);

  useEffect(() => {
    const element = chatScrollContainerRef.current;
    
      setTimeout(() => {
        if (element && userInput==="") {
          if(scroll) element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth',
          });
          else  element.scrollTo({
            top: element.scrollHeight,
          });
        }
      }, 1); 
    setScroll(true);
  }, [userInput]);

  useEffect(() => {
    const element = chatScrollContainerRef.current;
    setTimeout(() => {
      if(setScroll) element.scrollTo({ top: element.scrollHeight });
    }, 1); 
  
    setScroll(true);
  }, [chatHistory, chatUpdatePing]);


  useEffect(() => {
    if (scramble) {
      const interval = setInterval(() => {
        setDots((prev) => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500); 
      return () => clearInterval(interval); 
    } else {
      setDots(''); 
    }
  }, [scramble]);

  useEffect(() => {
    if (chatHistory.length > 0 && isHydrated) {
      const element = chatScrollContainerRef.current;
      const newMessageIndex = chatHistory.length - 1;
      const newMessage = chatHistory[newMessageIndex];
  
      if (!newMessage?.text || newMessage.user) return;
  
      let index = -1;
      setCurrentMessageIndex(newMessageIndex);
      setStreamingText('');
  
      const interval = setInterval(() => {
        if (index < newMessage.text.length-1) {
          setStreamingText((prev) => prev + newMessage.text[index]);
          element.scrollTo({ top: element.scrollHeight });
          index++;
        } else {
          clearInterval(interval); 
          setCurrentMessageIndex(null); 
        }
      }, 50);
  
      return () => clearInterval(interval);
    }
  }, [chatUpdatePing]);

  const handleClick = (id) => {
    router.push({
      pathname: '/dashboard',
      query: { id: id },
    });
  };

  return (
    <div ref={chatScrollContainerRef} className="chat-page">
      <ChatSplash />
      <div className={isHydrated && mobileClient ? 'chat-container-mobile' : 'chat-container'}>
        {chatHistory.map((message, index) => (
          <div
            key={message.id}
            className={`chat-bubble chat-bubble-link ${
              message.user ? 'userBubble' : 'aiBubble'
            } ${message.revcard_id ? '' : 'disabled'}`}
            onClick={() => {
              if (message.revcard_id) handleClick(message.revcard_id);
            }}
          >
            {currentMessageIndex === index ? streamingText : message.text}
            {message.revcard_id && (
              <img className="bubble-icon" src="/icon/external.svg" alt="card score"></img>
            )}
          </div>
        ))}

        {(!router.query.id && scramble) && (
          <div className="chat-bubble aiBubble processing-bubble">
            {placeholder} {dots}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChat;
