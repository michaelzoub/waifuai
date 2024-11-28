"use client"
import { useEffect, useRef } from "react";
import * as PIXI from 'pixi.js';
import 'pixi-live2d-display'

export default function Model() {

    const canvasRef = useRef<any>(null)

    useEffect(() => {
        const url = 'https://raw.githubusercontent.com/guansss/pixi-live2d-display/master/test/assets/shizuku/shizuku.model.json';

        const app = new PIXI.Application({
          view: canvasRef?.current,
          autoStart: true,
          resizeTo: window
        });
        
        let mouthValue = 0;
        
        app.ticker.add(() => {
          // mimic the interpolation value, 0-1
          mouthValue = Math.sin(performance.now() / 200) / 2 + 0.5;
        });
        
        PIXI.live2d.Live2DModel.fromModelSettingsFile(url).then((model) => {
          app.stage.addChild(model);
          
          model.anchor.set(0.5, 0.5);
          model.position.set(innerWidth / 2, innerHeight / 2);
          
          const size = Math.min(innerWidth, innerHeight) * 0.8;
          model.width = size;
          model.height = size;
          
          const updateFn = model.internal.motionManager.update;
          
          model.internal.motionManager.update = () => {
            updateFn.call(model.internal.motionManager);
            
            // overwrite the parameter after calling original update function
            model.internal.coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthValue);
          }
        });
        
    }, [])
    return (
        <div>
            <script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script> 
<script src="http://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.2.1/pixi.min.js"></script>
<script src="https://github.com/guansss/pixi-live2d-display/releases/download/v0.2.1/browser.js"></script>

<canvas ref={canvasRef}></canvas>
        </div>
    )
}