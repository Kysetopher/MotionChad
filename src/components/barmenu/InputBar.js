// components/InputBar/index.jsx
'use client';
import { useCreateTitleEditor } from '@/components/editor/use-create-title-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plate, resetEditorChildren,  RenderPlaceholderProps} from '@udecode/plate/react';
import { useGeneralContext }   from '../../ContextProvider';
import dynamic from 'next/dynamic';
import '../../styles/InputBar.css';
import EyeTracking, { blink } from '../eye/EyeTracking';
import SuggestionBar from './SuggestionBar';
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
  const { setSuggestions, userInput = '', userData, setRevCache, setUserInput, ReverieManager, pageState, openRev, scramble, setScramble,
    mobileClient, inputBarWrapRef, revCache, placeholder, setPlaceholder, session, reverieData, setSuggestionsActive, scrollChatToBottom, isAtBottom } = useGeneralContext();
  const [isMobileClient, setIsMobileClient] = useState(false);
  const [previousRequest, setPreviousRequest] = useState("");
  const router = useRouter();

  const inputBarRef = useRef(null);

  const initialValue = [{ type: 'p', children: [{ text: '' }] }];
  const editor = useCreateTitleEditor({
    readOnly:
      !reverieData ||
      !reverieData.access_level ||
      reverieData.access_level === 'SHARED',
    value: initialValue,
  });


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
      console.log(pageState);
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
          console.log(userInputPromise);
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

    if (isEmptyParagraph) {
      ReverieManager.processEmptyCard(input, openRev, updateExistingCard);
    } else return ReverieManager.processUpdateTile(input, openRev, updateExistingCard);
  };

  const inputChat = async (input) => {
    if (router.query.id) {
      return ReverieManager.addChat({ user: true, text: input, receiver_id: router.query.id });
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
    if (cardData.id) router.push({
      pathname: '/dashboard',
      query: { id: cardData.id },
    });
  };
  
  useEffect(() => {
    if (pageState.id === "reverie" && revCache && userData) {
      if (reverieData) setPlaceholder(reverieData.question);
    } else setPlaceholder("Hey " + userData?.name?.split(' ')[0] + ", what's on your mind?");
    if (scramble) setPlaceholder("Reflecting: " + previousRequest);
    if (!session || !userData) setPlaceholder("");
  }, [userData, previousRequest, openRev, pageState, scramble, revCache, reverieData]);

  // useEffect(() => {
  //   const textarea = inputBarRef.current;
  //   console.log(inputBarRef.current);
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

  return (
    <div ref={inputBarWrapRef} className="input-bar-wrapper">
      {pageState.id === 'agent' && <SuggestionBar />}
      <div className="input-bar" ref={inputBarRef}>
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