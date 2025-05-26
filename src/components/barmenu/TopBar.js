import React from 'react';
import { useGeneralContext } from '../../ContextProvider';
import TitleBar from './TitleBar';
import TitleBarNew from './TitleBarNew';
import { SettingsButton, NavigationTabs } from '../items/TopBarButton';
import '../../styles/TopBar.css';

function TopBar() {
  const { pageState, topbarDelete, reverieData, openRev } = useGeneralContext();

  return (
    <div className={`header ${topbarDelete ? 'header-delete' : ''}`}>
      <NavigationTabs />
      <SettingsButton />

      {pageState.id === 'subscription' &&  <div className="topbar-title">MANAGE SUBSCRIPTION</div>}
      {pageState.id === 'checkout'     &&  <div className="topbar-title">SUBSCRIPTION</div>}
      {pageState.id === 'membership'   &&  <div className="topbar-title">MEMBERSHIP</div>}
      {pageState.id === 'settings'     &&  <div className="topbar-title">SETTINGS</div>}
      {pageState.id === 'profile'      &&  <div className="topbar-title">PROFILE</div>}

      {(pageState.id === 'reverie' || pageState.id === 'public_reverie') && reverieData && (
        <TitleBar title={reverieData.title} />
      )}

      {pageState.id === 'dashboard' && (
        <TitleBarNew title={openRev ? reverieData.title : null} />
      )}
    </div>
  );
}

export default TopBar;
