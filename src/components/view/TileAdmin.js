import React, { useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import '../../styles/TileContainer.css';
import { useRouter } from 'next/router';


const TileAdmin = () => {
  const { mobileClient, ReverieManager, reverieData, allUsers, setRevCache, revCache, openRev, topbarDelete, setTopbarDelete} = useGeneralContext();
  const [showCopied, setShowCopied] = useState(false);
  const router = useRouter();
  
  const [statusCollapsed, setStatusCollapsed] = useState(false);
  const [editorsCollapsed, setEditorsCollapsed] = useState(false);
  const [manageCollapsed, setManageCollapsed] = useState(false);

  const handleDeleteReverie = async () => {
    const success = await ReverieManager.deleteReverie(openRev);
    if (success) {
        setRevCache(revCache.filter(card => card.id !== openRev));
        router.push('/dashboard');
    }
  };
  const handleCopy = () => {
    const linkToCopy = `www.example.com/public?id=${reverieData.id}`;
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000); // Hide "Copied!" after 2 seconds
    }).catch(err => {
      console.error("Failed to copy the link: ", err);
    });
  };
  const handleChangeAccess = (access_level) => {
    ReverieManager.updateReverie(reverieData.id,{visibility: access_level})
  };


  return (
    <div className="tile-container">
      
{ /*//-----------------------------------------|                          |---------------------------------------------------------------------------
    //                                         |     STATUS CONTAINER     |
    //-----------------------------------------|__________________________|---------------------------------------------------------------
    */}
      <div className={`card-container ${statusCollapsed ? 'collapsed' : ''}`}>
        <div 
          className="card-container-tab" 
          onClick={() => setStatusCollapsed(!statusCollapsed)}
        >
          <div className="card-container-title-count">
            {statusCollapsed ? '▶' : '▼'}
          </div>
          <div className="card-container-title">STATUS</div>
        </div>
        {!statusCollapsed && (
          <div className="container my-3">
            <div className="row">
              <div className={`${mobileClient ? 'bootstrap-column-mobile' : 'bootstrap-column'} col-6 col-md-6`}>
                <button 
                  className={`button-toggle-pair ${reverieData.visibility === 'PRIVATE' ? 'inactive-button' : 'hollow-button'}`}
                  onClick={() => handleChangeAccess("PRIVATE")}
                >
                 <div className="button-text"> Private</div>
                </button>
                <button
                  className={`button-toggle-pair ${reverieData.visibility === 'PUBLIC_READ' ? 'inactive-button' : 'hollow-button'}`}
                  onClick={() => handleChangeAccess("PUBLIC_READ")}
                >
                   <div className="button-text">Public</div>
                </button>
            
              </div>
              <div className={` ${mobileClient ? 'bootstrap-column-mobile' : 'bootstrap-column'} col-6 col-md-6`}>
              <div>
                <div className="copy-link-object"  onClick={handleCopy}>
                  <p >
                    www.example.com/public?id={reverieData.id}
                  </p>
                
                  {showCopied && "Copied!"}
                  
                  <img  src="./icon/copy.svg" >
                   
                  </img>
                </div>
                <p>
                  With public active, anyone with the link can view the card, but only editors can edit it.
                </p>
                </div>
              </div>
            </div>
          </div>
          
        )}
    </div>
{ /*//-----------------------------------------|                          |---------------------------------------------------------------------------
    //                                         |     EDITORS CONTAINER    |
    //-----------------------------------------|__________________________|---------------------------------------------------------------
    */}
      <div className={`card-container ${editorsCollapsed ? 'collapsed' : ''}`}>
        <div className="card-container-tab"  onClick={() => setEditorsCollapsed(!editorsCollapsed)}>
          <div className="card-container-title-count">
            {editorsCollapsed ? '▶' : '▼'}
          </div>
          <div className="card-container-title">EDITORS</div>
        </div>
        {!editorsCollapsed && (
         <div className="container my-3">
            <div className="row">
              <div className={`${mobileClient ? 'bootstrap-column-mobile' : 'bootstrap-column'} col-6 col-md-6`}>
                  {Array.isArray(reverieData.users_with_access) && reverieData.users_with_access.map((user, index) => {
                    const matchedUser = allUsers.find(u => u.id === user.user_id);
                    return (
                      <div key={index} className="bootstrape-list-item" >
                        <div>{matchedUser?.name || 'Unknown'}</div>
                        <div>{user?.access_level || 'N/A'}</div>
                      </div>
                    );
                  })}
              </div>
              <div className={`${mobileClient ? 'bootstrap-column-mobile' : 'bootstrap-column'} col-6 col-md-6`}>
              <p>Current Card Editors.</p>
             
              </div>
            </div>
          </div>
          )}
      </div>
{ /*//-----------------------------------------|                          |---------------------------------------------------------------------------
    //                                         |     MANAGE CONTAINER     |
    //-----------------------------------------|__________________________|---------------------------------------------------------------
    */}        

      <div className={`card-container ${manageCollapsed ? 'collapsed' : ''}`}>
        <div 
          className="card-container-tab" 
          onClick={() => setManageCollapsed(!manageCollapsed)}
        >
          <div className="card-container-title-count">
            {manageCollapsed ? '▶' : '▼'}
          </div>
          <div className="card-container-title">MANAGE</div>
        </div>
        {!manageCollapsed && (
           <div className="container my-3">
           <div className="row">
             <div className={`${mobileClient ? 'bootstrap-column-mobile' : 'bootstrap-column'} col-6 col-md-6`}>
                  <button className="negative-button" onClick={handleDeleteReverie}>
                    <div className="button-text">DELETE REVERIE</div> <img className="button-img" src='/icon/block-trashcan.svg'></img>
                  </button>

                  </div>
              <div className={`${mobileClient ? 'bootstrap-column-mobile' : 'bootstrap-column'} col-6 col-md-6`}>
              <p>This will permanently delete the Reverie.</p>
             
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TileAdmin;
