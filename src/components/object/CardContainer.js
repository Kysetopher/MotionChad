import React, { useEffect, useState } from 'react';
import Card from './Card';
import { EmptyCardContainer, LoadingSplash } from '../items/Splash';
import '../../styles/CardContainer.css';
import { useGeneralContext } from '../../ContextProvider';

const CardContainer = ({ swipeCardRight, swipeCardLeft, mouseCardClick, noCardsComponent, noResultsComponent,renderCardScore, expandedCardComponent, deleteCard = null, cards, displayNew }) => {
  const { userInput = '' } = useGeneralContext();

  // Introduce a loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assume data fetching occurs here or in a parent component
    // Update the loading state accordingly
    if (cards !== undefined) {
      setLoading(false);
    }
  }, [cards]);

  return (
    <div className="card-container">
      {loading ? ( <LoadingSplash /> ) :
        !cards || cards.length === 0 ? (noResultsComponent && userInput !== '' ? (noResultsComponent) : noCardsComponent ? (noCardsComponent) : ( <EmptyCardContainer /> )) : 
        (
          cards.map((card, index) => (
            <Card
              key={index}
              card={card}
              index={index}
              swipeRight={() => swipeCardRight(card.id)}
              swipeLeft={() => swipeCardLeft(card.id)}
              onDelete={deleteCard ? () => deleteCard(card.id) : null}
              mouseClick={() => mouseCardClick(card.id)}
              renderExpanded={  expandedCardComponent ? expandedCardComponent :null}
              renderScore = { renderCardScore ? () => renderCardScore(card.score) : null}
              displayNewAnimation = { displayNew ? true : false}
            />
          ))
        )}
    </div>
  );
};

export default CardContainer;