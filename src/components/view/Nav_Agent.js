import React, { useRef } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import CardContainer from '../object/CardContainerDragDrop';
import '../../styles/ReverieContainer.css';
import '../../styles/chat.css';
import { useRouter } from 'next/router';
import { DragDropContext } from '@hello-pangea/dnd';
import '../../styles/insights.css';
const notificationIcons = {
  NEW_CARD: '/icon/insight-add-fill.svg', 
  NEW_INSIGHT: '/icon/insight-add-fill.svg',
  UPDATE_INSIGHT: '/icon/insight-update-fill.svg',
  default:'/icon/insight-update-fill.svg',
};

const filterFunctions = {
  Agent: (card) => card.id === null,
  User: (card) => card.id !== null,
};

const NavAgent = () => {
  const  notifications = [];
  const cardScrollContainerRef = useRef(null);
  const router = useRouter();

  const onDragEnd = async (result) => {
    // Handle drag-and-drop logic here
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div ref={cardScrollContainerRef} className="tile-container">

        <div className="card-container">
          {notifications.map((notification, index) => (
            <div key={index}  data-category={notification.cateogory} className="notification">
                   <div className="notification-icon">
                <img className="tab-icon" src={notificationIcons[notification.type] || notificationIcons.default}></img>
              </div>
              <div>{notification.value}</div>
            </div>
          ))}
        </div>
      </div>
      
    </DragDropContext>
  );
};

export default NavAgent;
