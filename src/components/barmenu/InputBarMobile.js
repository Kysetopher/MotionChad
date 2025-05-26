// components/InputBar/index.jsx
'use client';
import { useCreateTitleEditor } from '@/components/editor/use-create-title-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plate} from '@udecode/plate/react';
import dynamic from 'next/dynamic';
import { useGeneralContext } from '../../ContextProvider';
import '../../styles/InputBar.css';
import EyeTracking, { blink } from '../eye/EyeTracking';
import SuggestionBar from './SuggestionBar';
import { AddNewCard } from '../items/Splash';
import { useRouter } from 'next/router';

const EditorContainer = dynamic(
  () =>
    import('@/components/plate-ui/editor').then((mod) => mod.EditorContainer),
  { ssr: false }
);

const Editor = dynamic(
  () => import('@/components/plate-ui/editor').then((mod) => mod.Editor),
  { ssr: false }
);

const getText = (nodes) => {
  if (!Array.isArray(nodes)) return ''

  return nodes
    .filter(node => node && Array.isArray(node.children))
    .map(node =>
      node.children
        .filter(child => child && typeof child.text === 'string')
        .map(child => child.text)
        .join('')
    )
    .join('\n')
}

const InputBar = () => {


  const { setSuggestions, userInput = '',userData, setRevCache, setUserInput, ReverieManager, pageState, openRev,scramble , setScramble, setSuggestionsActive,
      mobileClient, inputBarWrapRef, revCache, placeholder, setPlaceholder, session, scrollChatToBottom, reverieData, isAtBottom } = useGeneralContext();

  const [previousRequest, setPreviousRequest] = useState("");
  const [dragOverlay,  setDragOverlay] = useState(false);
  const [overlaySuccess, setOverlaySuccess] = useState(false);
  const [startY, setStartY] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const router = useRouter();

  const initialValue = [{ type: 'p', children: [{ text: '' }] }];

  const editor = useCreateTitleEditor({
    readOnly:
      !reverieData ||
      !reverieData.access_level ||
      reverieData.access_level === 'SHARED',
    value: initialValue,
  });

  const inputBarRef = useRef(null);




  const handleUserInput = async () => {
    if (!scramble && (reverieData?.is_streaming !== true) && userInput.trim() !== '') {
      editor.tf.reset({ children: true });
      setSuggestionsActive(false);
      setScramble(true);
      setPreviousRequest(userInput);
      setUserInput('');
      scrollChatToBottom();
        
      const currentHeight = parseFloat(getComputedStyle(inputBarRef.current).getPropertyValue('--textarea-height') || 0);
      const targetHeight = 2.2 * parseFloat(getComputedStyle(document.documentElement).fontSize || 16); 
      const heightDifference = Math.abs(targetHeight - currentHeight);

      let startTime = Date.now();
      let userInputPromise;

      switch (pageState.id) {
        case "dashboard":
          userInputPromise = inputNewReverie(userInput);
          setScramble(false);
          break;
        case "reverie":
          userInputPromise = inputUpdateReverie(userInput);
          await userInputPromise;
          setScramble(false);
          break;
          case "agent":
            userInputPromise = inputAgentChat(userInput);
            await userInputPromise;
            setScramble(false);
            break;
            case "chat":
            userInputPromise = inputChat(userInput);
            await userInputPromise;
            setScramble(false);
            break;
        default:
          return;
      }
      scrollChatToBottom();
      let endTime = Date.now();
      console.log(`Time taken for response: ${endTime - startTime}ms`);
    } else if(!scramble && userInput.trim() === ''){
      // if(router.pathname!=='/chat') router.push({ pathname:'/chat'});
      // if(router.pathname==='/chat') router.push({ pathname:'/'});
    }
    blink();
  };

  const inputNewReverie = async (input) => {
    const tempCard = {
      id: 'temp-' + Date.now(),
      title: 'Reflecting...',
      summary: input,
      ai_response: '',
      tags: [],
      score: null,
      created_at: new Date().toISOString(),
      tiletype: 'revtile',
      viewed: false,
    };

    setRevCache(prevCards => [...prevCards, tempCard]);
    const inputData = {
      userinput: input
    };
    return ReverieManager.processNewCard(inputData, tempCard.id, updateExistingCard);
  };

  const inputUpdateReverie = async (input) => {
    const isEmptyParagraph = reverieData.body &&
     JSON.parse(reverieData.body)[0].children?.[0]?.text === "" &&
     JSON.parse(reverieData.body)[0].children.length === 1;

    if(isEmptyParagraph ){
      ReverieManager.processEmptyCard(input, openRev, updateExistingCard);
    } else  return ReverieManager.processUpdateTile(input, openRev, updateExistingCard);
  };

  const inputChat = async (input) => {
    if(router.query.id) {
      return ReverieManager.addChat({user:true,text:input, receiver_id: router.query.id});
    } 
  };
  const inputAgentChat = async (input) => {
    scrollChatToBottom();
    const updatedSuggestions = await ReverieManager.processChatAgent(input);
     setSuggestions(updatedSuggestions);
     if (isAtBottom) scrollChatToBottom();
       return;
  
   };


  const updateExistingCard = (existingCardId, cardData) => {
    const newData = cardData;
    setRevCache(prevCards => {
      const updatedCards = prevCards.map(card =>
        card.id === existingCardId ? { ...card, ...newData } : card
      );
      return updatedCards;
    });

    //MOBILE ONLY FOR TESTING
    if(router.query.id !== existingCardId) router.push({
      pathname: '/dashboard',
      query: { id:  cardData.id },
    });
  };

  useEffect(() => {
    if (pageState.id ==="reverie" && revCache && userData) {
      const openReverie = revCache.find(reverie => reverie.id === openRev);
      if (openReverie) setPlaceholder(openReverie.question);
    } else setPlaceholder("Hey " + userData?.name?.split(' ')[0] + ", what's on your mind?");
    if (scramble) setPlaceholder("Reflecting: " + previousRequest);
  }, [previousRequest, openRev, pageState, scramble, revCache]);



    // useEffect(() => {
    //   const textarea = inputBarRef.current;
    
    //   if (session) {
    //     if (!scramble) {
    //       textarea.style.setProperty('--textarea-height', 'auto');
    //       const newHeight = `${textarea.scrollHeight}px`;
    //       textarea.style.setProperty('--textarea-height', newHeight);
    //     } else {
    //       const currentHeight = parseFloat(getComputedStyle(textarea).getPropertyValue('--textarea-height') || 0);
    //       const targetHeight = 2.2 * parseFloat(getComputedStyle(document.documentElement).fontSize || 16); 
    //       const heightDifference = Math.abs(targetHeight - currentHeight);
  
    //       const duration = Math.min(5, Math.max(0.2, heightDifference / 50)); 
    
    //       textarea.style.transition = `height ${duration}s ease`;
    //       requestAnimationFrame(() => {
    //         textarea.style.setProperty('--textarea-height', '2.2em');
    //       });
    //     }
    //   } else {
    //     textarea.style.transition = 'none';
    //     textarea.style.setProperty('--textarea-height', '0');
    //   }
    // }, [placeholder, userInput, scramble, session]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    setDragDistance(startY - currentY);

    if (dragDistance > 0) {
      setDragOverlay(true);
      document.documentElement.style.setProperty('--overlay-drag-position', `${dragDistance}px`);
      const viewHeight = window.innerHeight;
      const opacityValue = Math.min(1, (dragDistance / viewHeight) + 0.5);
      document.documentElement.style.setProperty('--overlay-opacity', `${opacityValue}`);
    }
  };

  const handleTouchEnd = async () => {

    const viewHeight = window.innerHeight;
    if(dragDistance > viewHeight / 4){
      setOverlaySuccess(true);
      const cardId = await ReverieManager.addCard({title:"New Card", plate: [{ type: 'p', children: [{ text: "" }] }]});
      const page = pageState.id;
      
      router.push({
        pathname:'/dashboard',
        query: { id: cardId },
      }).then(() => { 
        if( page === "reverie" || page === "dashboard") window.location.reload();
      });

    }
    setDragOverlay(false);
    document.documentElement.style.setProperty('--overlay-drag-position', `0px`);
    document.documentElement.style.setProperty('--overlay-opacity', `0`);
 
  };

  useEffect(() => {
    const inputBarElement = inputBarWrapRef.current;
  
    const options = { passive: true }; 
  
    inputBarElement.addEventListener("touchstart", handleTouchStart, options);
    inputBarElement.addEventListener("touchmove", handleTouchMove, options);
    inputBarElement.addEventListener("touchend", handleTouchEnd, options);
  
    return () => {
      inputBarElement.removeEventListener("touchstart", handleTouchStart, options);
      inputBarElement.removeEventListener("touchmove", handleTouchMove, options);
      inputBarElement.removeEventListener("touchend", handleTouchEnd, options);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart]);

  return (
      <div ref={inputBarWrapRef} className="input-bar-wrapper">

      <div className={`inputbar-drag-overlay ${!dragOverlay? 'hidden-inputbar-overlay' : overlaySuccess?'full-inputbar-overlay' : ''}`}>
        <AddNewCard />
      </div>

      {(pageState.id === "agent")&& <SuggestionBar /> }

      <div className="input-bar input-bar-mobile" ref={inputBarRef}>
        <Plate editor={editor} onChange={({ value }) => { setUserInput(getText(value)); }}  >
           <EditorContainer>
                    <Editor
                    
                     placeholder={placeholder}
                     variant={"inputBar"}
                     onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !mobileClient && !scramble) {
                        e.preventDefault();
                        handleUserInput();
                      }
                    }}
                    
                    />
          </EditorContainer>
        </Plate>


        <EyeTracking onClick={handleUserInput} />
      </div>
    </div>
  );
};

export default InputBar;