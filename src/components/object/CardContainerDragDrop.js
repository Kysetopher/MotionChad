import React, { useEffect, useState } from 'react';
import Card from './CardDraggable';
import { EmptyCardContainer, LoadingSplash } from '../items/Splash';
import '../../styles/CardContainer.css';
import { Droppable, Draggable } from "@hello-pangea/dnd";

const CardContainer = ({ title, droppableId, mouseCardClick, noCardsComponent, deleteCard, cards, initiallyCollapsed = false }) => {
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed); // Use the new prop for initial state

  useEffect(() => {
    if (cards !== undefined) {
      setLoading(false);
    }
  }, [cards]);

  const renderCards = () => {
    if (loading) {
      return <LoadingSplash />;
    }

    if (!cards || cards.length === 0) {
      return noCardsComponent ? noCardsComponent : <EmptyCardContainer />;
    }

    if (!droppableId) {
      return (
        <>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onDelete={deleteCard ? () => deleteCard(card.id) : null}
              mouseClick={() => mouseCardClick(card.id)}
            />
          ))}
        </>
      );
    }

    return cards
    .filter(card => card?.id != null)
    .map((card, index) => {
      const uid = `${droppableId}-${card.id}`;

      return (
        <Draggable key={uid} draggableId={uid} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={snapshot.isDragging ? 'dragging' : ''}
            >
              <Card
                displayNewAnimation
                card={card}
                onDelete={deleteCard ? () => deleteCard(card.id) : undefined}
                mouseClick={() => mouseCardClick(card.id)}
              />
            </div>
          )}
        </Draggable>
      );
    });
  };

  if (!droppableId) {
    return (
      <div className={`card-container ${collapsed ? 'collapsed' : ''}`}>
        {title && (
          <div className="card-container-tab" onClick={() => setCollapsed(!collapsed)}>
            <div className="card-container-title-count">
              {cards?.length || 0} {collapsed ? '▶' : '▼'}
            </div>
            <div className="card-container-title">{title}</div>
          </div>
        )}
        {!collapsed && (
          <div className="card-container-content">
            {renderCards()}
          </div>
        )}
      </div>
    );
  }

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`card-container ${collapsed ? 'collapsed' : ''} ${
            snapshot.isDraggingOver ? 'card-container-dropping' : ''
          }`}
        >
          {title && (
            <div className="card-container-tab" onClick={() => setCollapsed(!collapsed)}>
              <div className="card-container-title-count">
                {cards?.length || 0} {collapsed ? '▶' : '▼'}
              </div>
              <div className="card-container-title">{title}</div>
            </div>
          )}
          {!collapsed && (
            <div className="card-container-content">
              {renderCards()}
              {provided.placeholder}
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default CardContainer;
