import React, { useRef, useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import '../../styles/ReverieContainer.css';
import '../../styles/CardContainer.css';
import { useRouter } from 'next/router';
const NavSettings = () => {
  const {  pageSTATES, pageState } = useGeneralContext();

  const [tabs, setTabs] = useState([]);
  const cardScrollContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setTabs([
      {
        icon: 'icon/block-subscription.svg',
        label: 'Membership',
        page: pageSTATES.MEMBERSHIP,
      },
      {
        icon: '/icon/block-hippocampus.svg',
        label: 'Memory',
        page: pageSTATES.MEMORY,
      },
    ]);
  }, [pageSTATES]);

  const handleTabClick = (tab, index) => {
    router.push({
      pathname: '/settings',
      query: { page: tab.page.id },
    });
  };


  return (
    <div ref={cardScrollContainerRef} className="tile-container">
      <div className="card-tabs-container">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`card-container-tab ${tab.page.id === pageState.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab, index)}
          >
            <div className="card-container-title-icon"><img   src={tab.icon} alt="tab-icon" /></div>
            <div className="card-container-title">{tab.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavSettings;
