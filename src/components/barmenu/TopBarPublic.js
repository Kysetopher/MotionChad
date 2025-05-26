import React, { useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import TitleBar from './TitleBar';
import {HomeButton, NavigationTabs, DeleteRevpage, NavigationPyramid } from '../items/TopBarButton';
import '../../styles/TopBar.css';


function TopBarPublic() {
    const { ReverieManager, pageState, pageSTATES, processing, revCache, openRev, topbarDelete, reverieData} = useGeneralContext();




    
    return (
        <div className={`header ${topbarDelete ? 'header-delete' : ''}`}>
            <NavigationTabs/>
            <HomeButton/>
        </div>
    );
}

export default TopBarPublic;