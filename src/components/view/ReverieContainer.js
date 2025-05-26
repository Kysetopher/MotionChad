import React, {useState, useRef, useEffect } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import CardContainer from '../object/CardContainer';
import '../../styles/ReverieContainer.css';
import { SearchNoReveries } from '../items/Splash';
import { useRouter } from 'next/router';

const ReverieContainer = () => {
  const {session, ReverieManager, setRevCache, revCache, userInput} = useGeneralContext();
  const cardScrollContainerRef = useRef(null);
  const [ scroll, setScroll ] = useState(false);
  const router = useRouter();
  
  const sortReveries = (cardsToSort) => {
    if (!Array.isArray(cardsToSort)) {
      return []; // Return an empty array if cardsToSort is not an array
    }
    
    if (userInput) return cardsToSort.sort((a, b) => a.id - b.id);
  

        return cardsToSort.sort((a, b) => a.id - b.id);
 
  };

  const deleteReverie = async (id) => {
    if( session){
    setRevCache(revCache.filter(revs => revs.id !== id));

    const success = await ReverieManager.deleteReverie(id);
  
    if (success) {
 
    }}
  };

  const increaseRevScore = async (id) => {
    if( session){
      const index = revCache.findIndex(card => card.id === id);
      if (revCache[index] && revCache[index].score < 1) {
        const newScore = revCache[index].score + 1;
        const success = await ReverieManager.updateReverie(id, { score: newScore });
        if (success) {
          const updatedCards = [...revCache];
          updatedCards[index].score = newScore;
          setRevCache(updatedCards);
        }
      }
    }
  };
  const openRevPage = async (id) => {

  
 
    router.push({
      pathname:'/reverie',
      query: { id: id },
  });

    const index = revCache.findIndex(card => card.id === id);

    if(revCache[index] && revCache[index].score === null && session){
          
      const success = await ReverieManager.updateReverie(id, { viewed: true });
      if (success) {
        const updatedCards = [...revCache];
        updatedCards[index].viewed = true;
        setRevCache(updatedCards);
      }
    }
  }
  const decreaseRevScore = async (id) => {
    if( session){
      const index = revCache.findIndex(card => card.id === id);
      if (revCache[index] && revCache[index].score > -1) {
        const newScore = revCache[index].score- 1;
        const success = await ReverieManager.updateReverie(id, { score: newScore });
        if (success) {
          const updatedCards = [...revCache];
          updatedCards[index].score = newScore;
          setRevCache(updatedCards);
        }
      }
    }
  };
  const renderReverieScore = (score) =>  {
    switch(score){
      case -1:
        return <img className="card-score-img" src= "/tier_common.svg" alt="card score"></img>;
      case 0:
        return <img className="card-score-img" src= "/tier_nuetral.svg" alt="card score"></img>;
      case 1:
        return <img className="card-score-img" src= "/tier_epic1.svg" alt="card score"></img>;
      default:
        return null;
    }
  }




  useEffect(() => {
    const element = cardScrollContainerRef.current;
    
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
    const element = cardScrollContainerRef.current;
    setTimeout(() => {
      if(setScroll) element.scrollTo({ top: element.scrollHeight });
    }, 1); 
  
    setScroll(true);
  }, []);

  return (
    <div className="reverie-display" >
     <div ref={cardScrollContainerRef} className="reverie-container">
      <CardContainer
        swipeCardRight={increaseRevScore}
        swipeCardLeft={decreaseRevScore}
        mouseCardClick={openRevPage}
        deleteCard={deleteReverie}
        cards={revCache}
        noResultsComponent={<SearchNoReveries/>}
        displayNew={true}
      />
    </div>
    </div>
  );
};

export default ReverieContainer;