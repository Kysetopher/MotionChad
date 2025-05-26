import React, {useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { useGeneralContext} from '../../ContextProvider';


const ExpandedCard = ({ card, onDelete }) => {
    const { mobileClient } = useGeneralContext();
    
    return (
      <div className="inside">

        <div className="card-title" id={mobileClient ? 'cardtitlemobile' : 'cardtitledesktop'}>
          {card.title}
        </div>
        {card.title !== 'Processing...' && (
          <div className="card-summary-expanded" id={mobileClient ? 'cardsummarymobile' : 'cardsummarydesktop'}>
            {card.summary}
          </div>
        )}
      </div>
    );
  };
  
  const ExpandedCardLinked = ({ card, onDelete }) => {
    const { ReverieManager , mobileClient, revCache} = useGeneralContext();


    return (
      <div className="inside">

  
        <div className="card-title" id={mobileClient ? 'cardtitlemobile' : 'cardtitledesktop'} >
        {card.title}
        </div>
          
        

      </div>
    );
  };


  export {ExpandedCard, ExpandedCardLinked};