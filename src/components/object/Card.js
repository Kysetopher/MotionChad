import React, { useRef, useEffect, useState, useCallback } from 'react';
import '../../styles/Card.css';
import { ProcessingAnimation, ShinyAnimation } from '../items/Animations';
import { useGeneralContext } from '../../ContextProvider';

const Card = ({ card, index, swipeRight, swipeLeft, onDelete = null, mouseClick, renderExpanded, renderScore, onHold, displayNewAnimation }) => {
  const { id, title, summary, score, viewed, shuffle, slideup, slidedown } = card;
  const cardRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState([0, 0]);
  const [mousePos, setMousePos] = useState([0, 0]);
  const { mobileClient } = useGeneralContext();
  const [initialTouchX, setInitialTouchX] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState(null);
  const [isHeld, setIsHeld] = useState(false);

  const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

  const cardUpdate = useCallback(() => {
    if (cardRef.current) {
      const dimensions = cardRef.current.getBoundingClientRect();
      const l = mousePos[0] - dimensions.left;
      const t = mousePos[1] - dimensions.top;
      const h = dimensions.height;
      const w = dimensions.width;
      const px = clamp(Math.abs((100 / w) * l));
      const py = clamp(Math.abs((100 / h) * t));
      let dx = 0;
      if (dragging && Math.abs(mousePos[0] - initialTouchX) > 65) {
        dx = (mousePos[0] - dragStart[0]) / (dimensions.width / 100);
      }

      cardRef.current.style.setProperty('--pointer-x', `${px}%`);
      cardRef.current.style.setProperty('--pointer-y', `${py}%`);
      cardRef.current.style.setProperty('--drag-x', `${dx}%`);
    }
  }, [mousePos, dragStart, dragging, initialTouchX]);

  const handleMouseMove = useCallback((e) => {
    if (e.type === "touchmove") {
      setMousePos([e.touches[0].clientX, e.touches[0].clientY]);
    } else {
      setMousePos([e.clientX, e.clientY]);
    }
    cardUpdate();
  }, [cardUpdate]);

  const handleDragStart = useCallback((e) => {
    if (e.type === "touchstart" && !dragging) {
      setMousePos([e.touches[0].clientX, e.touches[0].clientY]);
      setDragStart([e.touches[0].clientX, e.touches[0].clientY]);
      setInitialTouchX(e.touches[0].clientX);
    } else {
      setDragStart([e.clientX, e.clientY]);
      setMousePos([e.clientX, e.clientY]);
      setInitialTouchX(e.clientX);
    }
    if (!expanded) {setDragging(true)};
    setIsHeld(false);

    // Start hold timer
    setHoldTimeout(setTimeout(() => {
      setIsHeld(true);
      if (onHold) onHold();
    }, 500));

    cardUpdate();
  }, [dragging, cardUpdate, onHold]);

  const handleDragEnd = useCallback((e) => {
    clearTimeout(holdTimeout); // Clear the hold timer when dragging ends
    setDragging(false);

    if(!isHeld)handleCardClick(e);


    if (e.type === "touchend") {
      setMousePos([e.changedTouches[0].clientX, e.changedTouches[0].clientY]);
    } else {
      setMousePos([e.clientX, e.clientY]);
    }

    const dragDistance = e.type === "touchend"
      ? e.changedTouches[0].clientX - initialTouchX
      : e.clientX - initialTouchX;

    if (Math.abs(dragDistance) > 65) {
      if (dragDistance > 66) {
        if(!expanded) swipeRight(index);
      } else if (dragDistance < -66) {
        if(!expanded) swipeLeft(index);
      }
    }

    cardUpdate();
    setInitialTouchX(null);
    // e.currentTarget.classList.remove('hover', 'active');
  }, [initialTouchX, swipeRight, swipeLeft, index, cardUpdate, holdTimeout, mousePos, dragStart, isHeld, mouseClick]);

  const handleDragCancel = useCallback((e) => {
    clearTimeout(holdTimeout); // Clear the hold timer when dragging is canceled
    e.currentTarget.classList.remove('hover', 'active');
  }, [holdTimeout]);

  const handleCardClick = useCallback((e) => {
    if (!(e.target.classList.length === 0)  && title !== 'Reflecting...') {
      const activeElement = document.activeElement;
      const cardElement = cardRef.current;
  
      // Check if the active element is a child of the card element
      const isChildFocused = cardElement && cardElement.contains(activeElement);
  
      if (mousePos[0] === dragStart[0] && mousePos[1] === dragStart[1]) {  
        mouseClick();
        if (expanded && isChildFocused) {
          setExpanded(true);
      } else  setExpanded((prev) => !prev);
  
      }
    }
  }, [title, mousePos, dragStart, mouseClick, expanded]);

  useEffect(() => {
      const cardElement = cardRef.current;

        if(mobileClient) {
          if(!expanded) {
            cardElement.addEventListener("touchmove", handleMouseMove);
            cardElement.addEventListener("touchcancel", handleDragCancel);
          }
          cardElement.addEventListener("touchstart", handleDragStart);
          cardElement.addEventListener("touchend", handleDragEnd);
          
        } else {
          if(!expanded) { cardElement.addEventListener("mousemove", handleMouseMove); }

          cardElement.addEventListener("mousedown", handleDragStart);
          cardElement.addEventListener("mouseup", handleDragEnd);
        }
      return () => {
      
        if(mobileClient) {

          if(!expanded) { 
            cardElement.removeEventListener("touchmove", handleMouseMove); 
            cardElement.removeEventListener("touchcancel", handleDragCancel);
          }

          cardElement.removeEventListener("touchstart", handleDragStart);
          cardElement.removeEventListener("touchend", handleDragEnd);
 

        } else {
          if(!expanded) {  cardElement.removeEventListener("mousemove", handleMouseMove); }
         
          cardElement.removeEventListener("mousedown", handleDragStart);
          cardElement.removeEventListener("mouseup", handleDragEnd);

        }
      };
  
    }, [expanded, handleMouseMove, handleDragStart, handleDragEnd, handleDragStart, handleDragEnd, handleDragCancel ]);



  return (
    <div
      className={`card ${mobileClient && dragging ? 'card touch' : !dragging && mobileClient ? 'card notouch' : ''}`}
      id={mobileClient ? 'cardmobile' : ''}
      ref={cardRef}
    >
      {(expanded && renderExpanded) ? React.cloneElement(renderExpanded, { card: card, onDelete: onDelete }) :

        (<div className={`inside ${viewed === false ? 'cardnew' : ''}`}>
          <div className="card-title" id={mobileClient ? 'cardtitlemobile' : 'cardtitledesktop'}>{title}</div>
          {/* <div className="card-summary" id={mobileClient ? 'cardsummarymobile' : 'cardsummarydesktop'}>{summary}</div> */}
        </div>
        )}
      {title === 'Reflecting...' && <ProcessingAnimation />}
      {(viewed === false&&  displayNewAnimation) && <ShinyAnimation />}
      {score !== null && <div className="card-score">  {renderScore && renderScore(card.score)}   </div>}
    </div>
  );
};

export default Card;