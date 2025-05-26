import React, { useEffect, useRef } from 'react';
import { useGeneralContext} from '../../ContextProvider';
import LoadingSwirl from '../items/LoadingSwirl.js';
import { gsap } from 'gsap';

const EyeOffline =  () => {
    useEffect(() => {
        
        gsap.set(".wifi-bar", { opacity: 0.3 }); 

        const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

        timeline
        .to("#bar1", { duration: 0.3, opacity: 0, ease: "power1.inOut" })
        .to("#bar1", { duration: 0.2, opacity: 0.7, ease: "power1.inOut" })
        .to("#bar1", { duration: 0.2, opacity: 0, ease: "power1.inOut" })
        .to("#bar1", { duration: 0.3, opacity: 0, ease: "power1.inOut" })
        .to("#bar2", { duration: 0.4, opacity: 0, ease: "power1.inOut" }, "-=0.25")
        .to("#bar2", { duration: 0.1, opacity: 0.2, ease: "power1.inOut" }, "-=0.25")
        .to("#bar2", { duration: 0.1, opacity: 0, ease: "power1.inOut" }, "-=0.25")
        .to("#bar2", { duration: 0.4, opacity: 0, ease: "power1.inOut" }, "-=0.25")
        .to("#bar3", { duration: 0.45, opacity: 0, ease: "power1.inOut" }, "-=0.25")
        .to("#bar3", { duration: 0.05, opacity: 0.1, ease: "power1.inOut" }, "-=0.25")
        .to("#bar3", { duration: 0.05, opacity: 0, ease: "power1.inOut" }, "-=0.25")
        .to("#bar3", { duration: 0.45, opacity: 0, ease: "power1.inOut" }, "-=0.25")
        .to("#circle", { duration: 0.5, opacity: 1, ease: "power1.inOut" }) 
        .to("#circle", { duration: 0.5, opacity: 0.5, ease: "power1.inOut" }); 
            
           
            
    }, []);

    return (
        <svg id="wifiLogo" width="50" height="50"  viewBox="0 0 100 100">
            <circle className="wifi-bar" id="circle" fill="#4CAF50" cx="50" cy="70" r="5"></circle>
            <path className="wifi-bar" id="bar1" d="M42,55 A18,18 0 0,1 58,55" opacity="0" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round"></path>
            <path className="wifi-bar" id="bar2" d="M32,45 A30,30 0 0,1 68,45" opacity="0" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round"></path>
            <path className="wifi-bar" id="bar3" d="M18,35 A45,45 0 0,1 82,35" opacity="0" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round"></path>
        </svg>
    );
};
const EyeLoading = () => {
    return (
        <LoadingSwirl/>
    );
}

const EyeUserInput = () => {
   

    return (
        <div className="empty-card-container"> no cards</div>
    );
};

export { EyeOffline, EyeUserInput, EyeLoading };