import React, { useEffect, useRef } from "react";
import gsap from "gsap";
const RotatingSwirl = () => {
  const swirlRef = useRef(null);

  useEffect(() => {
    gsap.to(swirlRef.current, {
      rotation: -360,
      repeat: -1,
      duration: 1.5,
      ease: "linear",
      transformOrigin: "center center",
    });
  }, []);

  return (
    <div ref={swirlRef} className='eye-swirl' >
      <img src='/icon/eye-swirl.svg' alt="Swirl" width="70" height="70" />
    </div>
  );
};

export default RotatingSwirl;