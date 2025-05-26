import React, { useRef, useEffect } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import CardContainer from '../object/CardContainerDragDrop';
import '../../styles/ReverieContainer.css';
import { useRouter } from 'next/router';
import { DragDropContext } from '@hello-pangea/dnd';

const filterFunctions = {
  New: (card) => card.score === null,
  Pinned: (card) => card.score === 1 ,
  Cache: (card) => card.score === 0,
};

const NavDashboard = () => {
  const { session, ReverieManager, setRevCache, revCache } = useGeneralContext();
  const cardScrollContainerRef = useRef(null);
  const router = useRouter();

  const filterCards = (filterKey) => {
    if (!revCache || !Array.isArray(revCache)) return [];
    return revCache.filter(filterFunctions[filterKey] || (() => true)).sort((a, b) => b.order_index - a.order_index);
  };


  const deleteReverie = async (id) => {
    if (session) {
      setRevCache((prev) => prev.filter((revs) => revs.id !== id));
      await ReverieManager.deleteReverie(id);
    }
  };

  const openRevPage = async (id) => {
    router.push({
      pathname: '/dashboard',
      query: { id },
    });

    const index = revCache.findIndex((card) => card.id === id);

    if (revCache[index] && revCache[index].viewed === false && session) {

      const success = await ReverieManager.updateReverie(id, { viewed: true });
      if (success) {
        const updatedCards = [...revCache];
        updatedCards[index].viewed = true;
        setRevCache(updatedCards);
      }
    }
  };

  const onDragEnd = async (result) => {

    const { destination, source, draggableId } = result;
    if (destination?.droppableId === 'New') return;
    if (!destination || !source.droppableId || !destination.droppableId) {
      return;
    }

    const isDifferentContainer = source.droppableId !== destination.droppableId;
  
    let updatedData = [];
  
    if (isDifferentContainer) {

      const sourceCategoryCards = revCache.filter((card) =>
        filterFunctions[source.droppableId](card)
      ).sort((a, b) => b.order_index - a.order_index);
      const destinationCategoryCards = revCache.filter((card) =>
        filterFunctions[destination.droppableId](card)
      ).sort((a, b) => b.order_index - a.order_index);

      const [movedCard] = sourceCategoryCards.splice(source.index, 1);
      destinationCategoryCards.splice(destination.index, 0, movedCard);

      updatedData = destinationCategoryCards.map((card, index) => ({
        id: card.id,
        order_index: destinationCategoryCards.length - index,
        score: destination.droppableId === 'Pinned' ? 1 : 0,
      }));

      console.log(updatedData);
    } else {
      const categoryCards = revCache.filter((card) =>
        filterFunctions[destination.droppableId](card)
      ).sort((a, b) => b.order_index - a.order_index);
  
      const [movedCard] = categoryCards.splice(source.index, 1);
      categoryCards.splice(destination.index, 0, movedCard);
  
      updatedData = categoryCards.map((card, index) => ({
        id: card.id,
        order_index: categoryCards.length - index,
        score: destination.droppableId === 'Pinned' ? 1 : 0,
      }));
    }
  
    
    const updatedCache = revCache.map((card) => {
      const updatedCard = updatedData.find((update) => update.id === card.id);
      if (updatedCard) {
        return {
          ...card,
          order_index: updatedCard.order_index,
          score: updatedCard.score,
        };
      }
      return card;
    });

    setRevCache(updatedCache);

    try {
      const result = await ReverieManager.batchUpdateReveries(updatedData);
  
      if (result.success) {
        // setRevCache(updatedCache.sort((a, b) => b.order_index - a.order_index));
    } else {
        console.error('Error updating sorted cards:', result.message);
      }
    } catch (error) {
      console.error('Error during batch card update:', error);
    }
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div ref={cardScrollContainerRef} className="tile-container">
        {Object.keys(filterFunctions).map((key) => (
          <CardContainer
            key={key}
            title={key !== 'New' ? key : undefined}
            droppableId={key !== 'Unread' ? key : undefined} // Exclude droppableId for Unread
            mouseCardClick={openRevPage}
            noCardsComponent={<></>}
            deleteCard={deleteReverie}
            cards={filterCards(key)}
            initiallyCollapsed={key !== 'New' ? true : false}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default NavDashboard;
