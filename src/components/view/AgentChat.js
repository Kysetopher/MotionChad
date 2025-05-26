import React, { useEffect, useState, useRef } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import { useRouter } from 'next/router';
import '../../styles/chat.css';
import { ChatSplash } from '../../components/items/Splash';
import { ChatCard, ChatDateIndicator } from '../object/ChatComponents';
import { ScrambleChatProcessing } from '../items/ScrambleTyping';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

function parseSupabaseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr.replace(' ', 'T').replace(/\+.*$/, 'Z'));
}

function isSameDay(dateA, dateB) {
  const dA = parseSupabaseDate(dateA);
  const dB = parseSupabaseDate(dateB);
  if (!dA || !dB) return false;
  return (
    dA.getFullYear() === dB.getFullYear() &&
    dA.getMonth() === dB.getMonth() &&
    dA.getDate() === dB.getDate()
  );
}



const AgentChat = () => {
  const {ReverieManager, scrollChatToBottom , chatStatus, setChatStatus,autoScrollingRef, chatScrollRef, scramble, setChatHistory,chatCache, mobileClient,setIsAtBottom,  isAtBottom, chatHistory, checkScrollPosition } = useGeneralContext();
  
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const [hideScrollBar, setHideScrollBar] = useState(false);

  const oldScrollHeight = useRef(0); 
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const lastChat = chatHistory[chatHistory.length - 1];
    if (lastChat && lastChat.viewed === false && isAtBottom) {
      ReverieManager.updateChat(lastChat.id, { viewed: true });
    }
  }, [chatHistory, isAtBottom]);

  useEffect(() => {

    setTimeout(() => {
      if (isAtBottom) {
        scrollChatToBottom();
      }
    }, 1);

  }, [chatHistory, isAtBottom]);

 

  useEffect(() => {
    if (chatCache?.length > 0) {
      const chatgroup = chatCache.find((item) => item.id === null);
      if (chatgroup) {
        setChatHistory(chatgroup.chats);
      }
    }
  }, [chatCache, router.query.id]);

  const handleCardClick = (id) => {
    router.push({
      pathname: '/dashboard',
      query: { id },
    });
  };

  useEffect(() => {
    let timeoutId;
    if (scramble) {
      setChatStatus('');
      timeoutId = setTimeout(() => {
        setChatStatus('Reflecting');
        scrollChatToBottom();
      }, 500);
    } else {
      setChatStatus('');
    }
    return () => clearTimeout(timeoutId);
  }, [scramble]);

  useEffect(() => {
    const element = chatScrollRef.current;
    if (!element) return;

    // Initialize our references
    oldScrollHeight.current = element.scrollHeight;
    lastScrollTopRef.current = element.scrollTop;

    const handleScroll = () => {
      const newScrollHeight = element.scrollHeight;
      const currentScrollTop = element.scrollTop;
      const clientHeight = element.clientHeight;
    
      const distanceFromBottom = newScrollHeight - currentScrollTop - clientHeight;
 
      setHideScrollBar(distanceFromBottom < clientHeight);

      if (autoScrollingRef.current === false) {
        if (currentScrollTop >= lastScrollTopRef.current) {
          checkScrollPosition();
        } else if (currentScrollTop < lastScrollTopRef.current) {
          setIsAtBottom(false);
        }
      }

      lastScrollTopRef.current = currentScrollTop <= 0 ? 0 : currentScrollTop;


      const messages = element.querySelectorAll('.chat-bubble');
      let newDate = new Date().toLocaleDateString();
      for (const message of messages) {
        const rect = message.getBoundingClientRect();
        if (rect.top >= 0) {
          const dateStr = message.getAttribute('data-date');
          if (dateStr) {
            newDate = new Date(dateStr).toLocaleDateString();
          }
          break;
        }
      }

      const rootElement = document.documentElement;
      if (rootElement) {
        rootElement.style.setProperty('--scrollbar-date', `"${newDate}"`);
      }

      autoScrollingRef.current = false;
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [
    setIsAtBottom,
    chatHistory
  ]);

  const lastChat = chatHistory[chatHistory.length - 1];
  const lastChatIsUnread = lastChat && !lastChat.viewed;

  let firstUnreadIndex = -1;
  if (lastChatIsUnread) {
    const reversedIndex = chatHistory
      .slice()
      .reverse()
      .findIndex(msg => !msg.viewed);

    if (reversedIndex !== -1) {
      firstUnreadIndex = chatHistory.length - 1 - reversedIndex;
    }
  }

  return (
    <SimpleBar
      className={`chat-page ${hideScrollBar ? 'hide-scrollbar' : ''}`}
      scrollableNodeProps={{ ref: chatScrollRef }}
    >
      <ChatSplash />
      <div
        className={
          isHydrated && mobileClient ? 'chat-container-mobile' : 'chat-container'
        }
      >
        {chatHistory.map((chat, index) => {
          const showDateIndicator =
            index === 0 ||
            !isSameDay(chat.created_at, chatHistory[index - 1]?.created_at);

          return (
            <React.Fragment key={chat.id || index}>
              {showDateIndicator && <ChatDateIndicator date={chat.created_at} />}
              <ChatCard
                chat={chat}
                streaming={lastChatIsUnread && index === chatHistory.length - 1}
                active={chatStatus === '' ? index === chatHistory.length - 1 : false }
                onCardClick={handleCardClick}
              />
            </React.Fragment>
          );
        })}

        {chatStatus && (
          <div className="chat-bubble processingBubble">
            <ScrambleChatProcessing />
          </div>
        )}
      </div>
    </SimpleBar>
  );
};

export default AgentChat;
