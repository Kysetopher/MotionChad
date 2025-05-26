import React from 'react';
import { useGeneralContext } from '../../ContextProvider'; 
import '../../styles/suggestion.css';

const Suggestion = ({ suggestion }) => {
  const { symbol, operation, text, hex_color } = suggestion;
  const { chatHistory, ReverieManager, setSuggestions, isAtBottom, setSuggestionsActive, mobileClient, setChatStatus, scrollChatToBottom } = useGeneralContext();

  const operations = {
  
    'question-answer': async () => {

      setChatStatus('Reflecting');
      setSuggestionsActive(false);
      scrollChatToBottom();
      const latestChat = chatHistory[chatHistory.length - 1];
      let newSuggestions
      if(latestChat.clarification) newSuggestions = await ReverieManager.processClarification(text, latestChat.id);
      else newSuggestions = await ReverieManager.processChatAgent(text);
      setChatStatus('');
      setSuggestions(newSuggestions);
      if (isAtBottom) scrollChatToBottom();
      
    },
    'create-card': async () => {
      console.log('Creating a new card...');
      // Implement your create-card logic here
    },
    'generate-insight': async () => {
      console.log('Generating insight...');
      // Implement your generate-insight logic here
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
      className={`${mobileClient? "suggestion-mobile":"suggestion"}`}
      onClick={runOperation} 
      style={{   border: `1px solid ${hex_color}`}}
    >
      {symbol}
    </div>
  );
};

const SuggestionBar = () => {
  const { suggestions, suggestionsActive, isBelowTablet } = useGeneralContext();


  return (
    <div className={`suggestion-bar ${isBelowTablet ? "suggestion-bar-mobile" : ""} ${!suggestionsActive ? "suggestion-bar-hidden" : ""}`}>
      {suggestions?.length > 0 && suggestions.map((suggestion, index) => (
        <Suggestion key={index} suggestion={suggestion} />
      ))}
    </div>
  );
};

export default SuggestionBar;
