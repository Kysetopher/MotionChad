import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const LoadingSwirl = ({ size = 200 }) => {
    const circlesRef = useRef([]);

    useEffect(() => {
        const circles = circlesRef.current;

        gsap.to(circles, {
            rotation: 360,
            transformOrigin: `${size*(3/8)}px 0px`,
            duration: 2,
            ease: 'none',
            repeat: -1,
            stagger: {
                each: 0.1,
                from: 'start',
            },
            opacity: (i, target, targets) => 1 - i / targets.length,
            filter: (i, target, targets) => `blur(${ 5 * (i / targets.length) }px)`,
    
        });
    }, []);

    return (
        <div className="loading-swirl">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {[...Array(10)].map((_, i) => (
                    <circle
                        key={i}
                        cx={`${size*(1/8)}`}
                        cy={`${size/2}`}
                        r={`${size/30}`}
                        fill="green"
                        ref={(el) => (circlesRef.current[i] = el)}
                    />
                ))}
            </svg>
        </div>
    );
};

export default LoadingSwirl;