import React, { useState, useEffect } from 'react';
import '../../styles/MultiTile.css';
import TilePlate from './TilePlate';
import TileAdmin from './TileAdmin';
import LoadingSwirl from '../items/LoadingSwirl';
import { useGeneralContext } from '../../ContextProvider';
import { useRouter } from 'next/router';

const TileMenu = () => {
  const { activeTab, setActiveTab, reverieData} = useGeneralContext();
  const router = useRouter();
  const [newTileTabs, setNewTileTabs] = useState([]);

  useEffect(() => {
    setActiveTab(0);
  }, []);
  useEffect(() => {
    if(router.query.id===undefined ) setActiveTab(0);
  }, [router.query]);
  useEffect(() => {
    const defaultTabs = [
      { 
        tiletype: "home",
        icon: '/icon/star-mourning.svg', 
        render: () => renderTileContent(reverieData)
      }

    ];
  
    let additionalTabs = [];
  
    if (reverieData && reverieData.access_level) {
      switch (reverieData.access_level) {
        case "OWNER":
        case "ADMIN":
          additionalTabs = [
            { 
              tiletype: "admin",
              icon: '/icon/shield.svg', 
              render: () => <TileAdmin /> 
            }
          ];
          break;
        case "EDITOR":
          break;
        default:
          break;
      }
    }
  
    setNewTileTabs([...defaultTabs, ...additionalTabs]);
  }, [reverieData]);

  const renderTileContent = (tile) => {

    return (
      <TilePlate
        plate={tile?.plate || null} version={tile?.version || null}
        
      />
    )
  };

  return (
    <div className="multi-tile" >
      <div className="tabs-container">

      {newTileTabs.map((tempTab, index) => (
        <div
          key={`temp-${index}`}
          className={`tab  ${activeTab ===  index ? 'active' : ''}`}
          onClick={() => setActiveTab(index)}
        >
          <img
                className= "w-8 h-10"
                src={tempTab.icon}
                alt="tab-img"
            />
        </div>
      ))}
      </div>

      <div className="tile-content"  >
      {activeTab !== null && newTileTabs[activeTab] && newTileTabs[activeTab].render()}
      </div>                                                                                              
    </div>
  );
};

export default TileMenu;