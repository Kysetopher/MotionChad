import React, { useRef, useEffect } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import CardContainer from '../object/CardContainerDragDrop';
import '../../styles/ReverieContainer.css';
import { useRouter } from 'next/router';
import { DragDropContext } from '@hello-pangea/dnd';



const NavPublic = () => {
  const { userData, session, ReverieManager, setPublicRevCache, publicRevCache } = useGeneralContext();
  const cardScrollContainerRef = useRef(null);
  const router = useRouter();

  const filterFunctions = {};
  
  if (session!==-1) {
    filterFunctions["Your Public Cards"] = (card) => userData && card.owner_id === userData.id;
  }
  
  filterFunctions["All Public Cards"] = (card) => (!userData) || card.owner_id !== userData.id;


  const filterCards = (filterKey) => {
    if (!publicRevCache || !Array.isArray(publicRevCache)) return [];
    return publicRevCache.filter(filterFunctions[filterKey] || (() => true));
  };

  const deleteReverie = async (id) => {
    if (session) {
      setPublicRevCache((prev) => prev.filter((revs) => revs.id !== id));
      await ReverieManager.deleteReverie(id);
    }
  };

  const openRevPage = async (id) => {
    router.push({
      pathname: '/public',
      query: { id },
    });

    const index = publicRevCache.findIndex((card) => card.id === id);

    if (publicRevCache[index] && publicRevCache[index].score === null && session) {
      const success = await ReverieManager.updateReverie(id, { viewed: true });
      if (success) {
        const updatedCards = [...publicRevCache];
        updatedCards[index].viewed = true;
        setPublicRevCache(updatedCards);
      }
    }
  };

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const movedCardIndex = publicRevCache.findIndex((card) => card.id === draggableId);
    if (movedCardIndex === -1) return;

    const movedCard = { ...publicRevCache[movedCardIndex] };
    let newScore;

    switch (destination.droppableId) {
      case 'Favorites':
        newScore = 1;
        break;
      case 'New Cards':
        movedCard.viewed = false;
        newScore = movedCard.score; // No score change
        break;
      case 'Reveries':
        newScore = 0;
        break;
      default:
        newScore = movedCard.score;
    }

    movedCard.score = newScore;

    const updatedRevCache = [...publicRevCache];
    updatedRevCache.splice(movedCardIndex, 1);

    const categoryCards = updatedRevCache.filter(filterFunctions[destination.droppableId] || (() => true));
    const otherCards = updatedRevCache.filter((c) => !categoryCards.includes(c));

    categoryCards.splice(destination.index, 0, movedCard);

    categoryCards.forEach((c, i) => {
      c.order_index = i;
    });

    const finalRevCache = [...otherCards, ...categoryCards];

    setPublicRevCache(finalRevCache);

    await ReverieManager.updateReverie(draggableId, { score: newScore, order_index: destination.index });
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div ref={cardScrollContainerRef} className="tile-container">
        {Object.keys(filterFunctions).map((key) => (
          <CardContainer
            key={key}
            title={key}
            droppableId={key !== 'All Public Cards' ? key : undefined}
            mouseCardClick={openRevPage}
            noCardsComponent={<></>}
            deleteCard={deleteReverie}
            cards={filterCards(key)}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default NavPublic;
