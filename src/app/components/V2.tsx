import { useEffect, useState } from 'react';

declare global {
  interface Window {
    live2DModel?: any;  // Declare live2DModel as an optional property
    live2D?: any;
    Live2DModelJS?: any;
  }
}

const Live2D = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Dynamically load the Live2D script on the client
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js";
    script.onload = () => {
      // Ensure the Live2D library is loaded before using it
      if (typeof window !== 'undefined' && window.loadlive2d) {
        window.loadlive2d(
          "live2d",
          "https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/r93_3501/model.json"
        );
      console.log("pre check")
      console.log("live2d :", window.live2DModel)
      if (window.live2DModel) {
        console.log("Animating mouth")
        let mouthOpenValue = 0.5;
        let direction = 0.02;

        const animateMouth = () => {
          // Oscillate mouth open value
          mouthOpenValue += direction;
          
          // Reverse direction at peaks
          if (mouthOpenValue > 0.5 || mouthOpenValue < 0) {
            direction *= -1;
          }

          // Set mouth open parameter
          // Note: The exact parameter name might vary between models
          try {
            window.live2DModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthOpenValue);
          } catch (error) {
            console.error("Could not set mouth parameter:", error);
          }

          // Continue animation
          requestAnimationFrame(animateMouth);
        };

        // Start mouth animation
        animateMouth();
      }
  
      }
    };
    document.body.appendChild(script);


    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  if (!mounted) {
    return null; 
  }

  return (
    <div className="flex items-center justify-center ml-[-300px] md:ml-[-600px] md:ml-[-300px] mt-[-0px] md:mt-[0px] mx-auto my-auto md:mx-auto z-50">
      <canvas id="live2d" width="1400" height="1200" className="mx-auto w-full"></canvas>
    </div>
  );
};

export default Live2D;