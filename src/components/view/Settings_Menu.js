import React, { useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import '../../styles/MultiTile.css';
import SettingsProfile from './SettingsProfile';
import SettingsSubscription from './SettingsSubscription';

const SettingsMenu = () => {
  const {pageSTATES, pageState } = useGeneralContext();

  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    setTabs([
      {
        icon: '/icon/card.svg',
        render: () => <SettingsSubscription />,
        page: pageSTATES.MEMBERSHIP
      },
      {
        icon: '/icon/block-hippocampus.svg',
        render: () => <SettingsProfile/>,
        page: pageSTATES.MEMORY
      }
    ]); 
  }, []);

  useEffect(() => {
    console.log(pageState);
  }, [pageState]);
  return (
    <div className="tile-content">
      {tabs.find(tab => tab.page.id === pageState.tab)?.render()}
      </div>
  );
};

export default SettingsMenu;