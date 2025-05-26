import React, { useEffect, useState } from 'react';
import { useGeneralContext } from '../../ContextProvider';
import TitleBar from './TitleBar';
import {SettingsButton, NavigationTabs, DeleteRevpage, NavigationPyramid } from '../items/TopBarButton';
import '../../styles/TopBar.css';


function TopBarMobile() {
    const { ReverieManager, pageState, pageSTATES, processing, revCache, openRev, topbarDelete, reverieData} = useGeneralContext();


    const FinishEditTitle = async (value) => {
        const titleText = value[0].children[0].text;
        if(titleText!==reverieData.title){
        try {
            
            const successTitle = await ReverieManager.updateReverie(openRev, { title: titleText, viewed: true });
            if (!successTitle) {
                console.error('Failed to update supabase with changes to title');
            }
        } catch (error) {
            console.error('Failed to update title:', error);
        }
        }
    };


    
    return (
        <div className={`header`}>
             {pageState.id === pageState.tab ? <NavigationTabs/>:<></> }
            <NavigationPyramid/>
            <SettingsButton/>
            {pageState.id ==="subscription" &&  <div className="topbar-title">MANAGE SUBSCRIPTION</div>}
            {pageState.id ==="checkout" && <div className="topbar-title">SUBSCRIPTION</div>}
            {pageState.id ==="membership" && <div className="topbar-title">MEMBERSHIP</div>}
            {pageState.id ==="settings" && <div className="topbar-title">SETTINGS</div>}
            {pageState.id ==="profile" && <div className="topbar-title">PROFILE</div>}
            {(pageState.id ==="reverie" || pageState.id ==="public_reverie" ) && reverieData && <TitleBar title={ reverieData.title } handleFinishEdit={FinishEditTitle} />}
        </div>
    );
}

export default TopBarMobile;