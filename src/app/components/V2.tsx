import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    live2DModel?: any;  // Declare live2DModel as an optional property
    live2D?: any;
    Live2DModelJS?: any;
  }
}

const Live2D = () => {
  const [mounted, setMounted] = useState(false)

  const canvasRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js"
    document.body.appendChild(script)
    script.onload = () => {
      const load2dlive = async () => {
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
            mouthOpenValue += direction;
            
            if (mouthOpenValue > 0.5 || mouthOpenValue < 0) {
              direction *= -1;
            }
  
            try {
              window.live2DModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthOpenValue);
            } catch (error) {
              console.error("Could not set mouth parameter:", error);
            }
  
            requestAnimationFrame(animateMouth);
          };
  
          animateMouth();
        }
    
        } else {
          setTimeout(() => {
            load2dlive()
          }, 500)
        }
      }
      load2dlive()
    };

  }, []);
  if (!mounted) {
    return null; 
  }

  return (
    <div className="flex items-center justify-center ml-[-300px] md:ml-[-600px] md:ml-[-300px] mt-[50px] md:mt-[0px] mx-auto my-auto md:mx-auto z-50">
      <canvas id="live2d" ref={canvasRef} width="1400" height="1200" className="mx-auto w-full"></canvas>
    </div>
  );
};

export default Live2D;