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
          "https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/r93_3501/model.json" // Ensure this path is correct
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
    <div className="flex items-center justify-center ml-[-600px] md:ml-[-300px] mt-[-50px] md:mt-[0px] mx-auto my-auto md:mx-auto z-50">
      <canvas id="live2d" width="1400" height="1200" className="mx-auto"></canvas>
    </div>
  );
};

export default Live2D;