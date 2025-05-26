import React, { useRef, useState, useEffect } from 'react';
import '../../styles/Card.css';
import { ProcessingAnimation, ShinyAnimation, SelectedAnimation } from '../items/Animations';
import { useGeneralContext } from '../../ContextProvider';
import { useDrag } from "react-dnd";
import { useRouter } from 'next/router';

const Card = ({ card, mouseClick, displayNewAnimation }) => {
  const { title, viewed,id } = card;
  const { mobileClient } = useGeneralContext();
  const router = useRouter();
  const holdStartTime = useRef(null); 
  const holdThreshold = 500;
  const [globalIsDragging, setGlobalIsDragging] = useState(false);

  useEffect(() => {
    if (globalIsDragging) {
      document.body.classList.add('global-dragging');
    } else {
      document.body.classList.remove('global-dragging');
    }
  }, [globalIsDragging]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: () => {
      setGlobalIsDragging(true); // Start drag logic
      return { id: card.id };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => setGlobalIsDragging(false), // End drag logic
  }));

  const handleMouseDown = () => {
    holdStartTime.current = Date.now(); // Store the current timestamp when mouse is pressed
  };

  const handleMouseUp = () => {
    const holdDuration = Date.now() - holdStartTime.current; 
    if (holdDuration < holdThreshold) {
      mouseClick(); 
    }
  };

  const handleMouseLeave = () => {
    holdStartTime.current = null; 
  };
  return (
    <div
      className={`card ${globalIsDragging ? 'global-dragging' : ''} ${isDragging ? 'local-dragging' : ''}`}
      id={mobileClient ? 'cardmobile' : ''}
      ref={drag}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`inside ${viewed === false ? 'cardnew' : ''}`}>
        <div className="card-title" id={mobileClient ? 'cardtitlemobile' : 'cardtitledesktop'}>{title}</div>
      </div>
      { id && id === router.query.id && <SelectedAnimation />}
      {title === 'Reflecting...' && <ProcessingAnimation />}
      {(viewed === false && displayNewAnimation) && <ShinyAnimation />}
    </div>
  );
};

export default Card;
