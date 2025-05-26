import React, { useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import { ScrambleChatStreaming} from '../items/ScrambleTyping';
import * as Separator from '@radix-ui/react-separator';

const renderRichText = (text) => {
  if(text){
  const boldRegex = /\*\*(.*?)\*\*/g;
  return text.replace(boldRegex, '<strong>$1</strong>');
}
};

const SuggestionItem = ({ suggestion, chat }) => {
  const { symbol, operation, text, hex_color } = suggestion;
  const { setSuggestionsActive, setSuggestions, setChatStatus, isAtBottom, ReverieManager, scrollChatToBottom } = useGeneralContext();

  const operations = {
    'question-answer': async () => {
      setChatStatus('Reflecting');
      setSuggestionsActive(false);
      scrollChatToBottom();
      let newSuggestions;
      if (chat.clarification) {
        newSuggestions = await ReverieManager.processClarification(chat.text, chat.id);
      } else {
        newSuggestions = await ReverieManager.processChatAgent(text);
      }
      setChatStatus('');
      setSuggestions(newSuggestions);
      if (isAtBottom) scrollChatToBottom();
    },
    'create-card': async () => {
      console.log('Creating a new card...');
    },
    'generate-insight': async () => {
      console.log('Generating insight...');
    }
  };

  const runOperation = async () => {
    if (operations[operation]) {
      await operations[operation]();
    } else {
      console.log("Suggestion clicked, operation not supported:", suggestion);
    }
  };

  return (
    <div
      className="suggestion-entry-chat suggestion-entry-active"
      onClick={runOperation}
    >
      <div
        className="suggestion-color-box"
        style={{ backgroundColor: suggestion.hex_color || '#000' }}
      ></div>
      <div>{suggestion.symbol}</div>
      <div>{suggestion.text}</div>
    </div>
  );
};

const SuggestionBlock = ({ chat }) => {
  return (
    <div className="suggestion-block-chat">
      {chat.suggestions &&
        chat.suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={index}
            suggestion={suggestion}
            chat={chat}
          />
        ))}
    </div>
  );
};


function ChatDateIndicator({ date }) {
  const dt = new Date(date);

  // Format it however you want
  const formattedDate = dt.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center my-4 justify-center">
      {/* Left line */}
      <Separator.Root className="flex-1 bg-gray-300 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full" />
      
      {/* Date label */}
      <span className="mx-2 text-sm text-gray-600">
        {formattedDate}
      </span>

      {/* Right line */}
      <Separator.Root className="flex-1 bg-gray-300 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full" />
    </div>
  );
}

const ChatUnreadIndicator = () => {
  return (
    <div className="flex items-center my-4 justify-center">
      <Separator.Root className="flex-1 bg-gray-300 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full" />

      <span className="mx-2 text-sm text-gray-600">
      Unread
      </span>

      <Separator.Root className="flex-1 bg-gray-300 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full" />
    </div>
  );
};

const ChatCard = ({ chat, streaming, onCardClick, active }) => {
  const { setSuggestionsActive, scrollChatToBottom ,isAtBottom} = useGeneralContext();
  const [isStreaming, setIsStreaming] = useState(streaming);
  return (
    <>
      <div
        className={`chat-bubble chat-bubble-link ${chat.user ? "userBubble" : "aiBubble"} ${
          chat.revcard_id ? "" : "disabled"
        }`}
        data-date={chat.created_at} 
        onClick={() => {
          if (chat.revcard_id && chat.card_name !== "Reflecting...") {
            onCardClick(chat.revcard_id);
          }
        }}
      >
        { isStreaming && !chat.user ? 

        <ScrambleChatStreaming  text= {chat.text} scrambleSpeed={99} delay={0} onComplete={() => {
          setIsStreaming(false);
          setSuggestionsActive(true);
          if (isAtBottom) setTimeout(() => {

            scrollChatToBottom();
          }, 1000); 

        }} /> :

        <span dangerouslySetInnerHTML={{
            __html: renderRichText(chat.text),
          }} />}

        {chat.revcard_id && (
          <div className="bubble-linked-card">
            {chat.card_name}{" "}
            <img className="bubble-icon" src="/icon/external.svg" alt="card score" />
          </div>
        )}
      </div>
      {(!isStreaming && active) && <SuggestionBlock chat={chat} />}
    </>
  );
};

export {ChatDateIndicator, ChatCard, ChatUnreadIndicator };