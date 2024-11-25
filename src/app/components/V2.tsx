import { useEffect, useState } from 'react';

const Live2D = () => {
  // State to check if the component is mounted on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark the component as mounted on the client
    setMounted(true);

    // Dynamically load the Live2D script on the client
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js";
    script.onload = () => {
      // Ensure the Live2D library is loaded before using it
      if (typeof window !== 'undefined' && window.loadlive2d) {
        window.loadlive2d(
          "live2d",
          "https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/haru_seifuku/model.json" // Ensure this path is correct
        );
      }
    };
    document.body.appendChild(script);

    // Cleanup the script on component unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Only render the canvas after the component has mounted (client-side)
  if (!mounted) {
    return null; // Or return a placeholder or loading component if you prefer
  }

  return (
    <div className="mt-[-300px] md:mt-[-200px] ml-[-150px] my-auto md:mx-auto z-50">
      <canvas id="live2d" width="800" height="1600"></canvas>
    </div>
  );
};

export default Live2D;