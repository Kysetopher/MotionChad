import React, { useRef, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import CardContainer from '../object/CardContainerDragDrop';
import '../../styles/ReverieContainer.css';
import { useRouter } from 'next/router';
import { DragDropContext } from '@hello-pangea/dnd';

const filterFunctions = {
  Agent: (card) => card.id === null,
  User: (card) => card.id !== null,
};

const NavChat = () => {
  const { allUsers, chatCache, setChatCache } = useGeneralContext();
  const cardScrollContainerRef = useRef(null);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const router = useRouter();

  const getChatGroupName = (card) => {
    if (!allUsers) return 'Loading...';

    // This is the "Agent"
    if (card.id === null) {
      return 'AGENT';
    }
    // This is a user
    const user = allUsers.find((u) => u.id === card.id);
    return user ? user.name : `Chat ${card.id}`;
  };

  const filterChat = (filterKey) => {
    if (!chatCache || !Array.isArray(chatCache)) return [];
    return chatCache
      .filter(filterFunctions[filterKey] || (() => true))
      .map((card) => ({
        ...card,
        title: getChatGroupName(card),
      }));
  };

  const openChat = async (id) => {
    if (id) {
      router.push({
        pathname: '/chat',
        query: { id },
      });
    } else {
      router.push({
        pathname: '/chat',
      });
    }
  };

  const onDragEnd = async (result) => {
    // Handle drag-and-drop logic here
  };

  const deleteReverie = async () => {
    // Handle delete logic if needed
  };

  // Toggle the custom dropdown open/closed
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle a user selection from our custom dropdown
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setIsDropdownOpen(false); 
    setChatCache((prevChats) => {
      // Optional: check if a chat with this userId already exists
      const alreadyExists = prevChats.some((chat) => chat.id === userId);
      if (alreadyExists) {
        return prevChats; // Avoid duplicates if you prefer
      }
  
      // Otherwise, create a new empty chat group
      return [
        ...prevChats,
        {
          id: userId,
          chats: [], // or whatever fields your chat object requires
        },
      ];
    });
    router.push({ pathname: '/chat', query: { id: userId } });
  };

  // Helper to display the currently selected user’s name or placeholder
  const getSelectedUserName = () => {
    if (!selectedUserId) return 'Select a User';
    const user = allUsers.find((u) => u.id === selectedUserId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div ref={cardScrollContainerRef} className="tile-container">
        {Object.keys(filterFunctions).map((key) => {
          // If you don't want to display "Agent", skip it
          if (key === 'Agent') return null;

          return (
            <CardContainer
              key={key}
              droppableId={key !== 'Agent' ? key : undefined}
              mouseCardClick={openChat}
              noCardsComponent={<></>}
              deleteCard={deleteReverie}
              cards={filterChat(key)}
            />
          );
        })}
        <div className="card-container-tab">
        <div className="card-container-title-count"> {isDropdownOpen ? '▶' : '▼'} </div>
          <div className="card-container-title" onClick={toggleDropdown}>
            {getSelectedUserName()}     
          </div>
          {isDropdownOpen && allUsers &&
            allUsers.map((user) => (
              <div
                key={user.id}
                className="card-container-title"
                onClick={() => handleUserSelect(user.id)}
              >
                {user.name}
              </div>
            ))}
           
        </div>
      </div>
    </DragDropContext>
  );
};

export default NavChat;
