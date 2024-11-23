"use client"
import { useEffect } from 'react'
//import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display';
import { useRef } from 'react';
import Script from 'next/script';

function V() {

  const canvasRef = useRef<any>(null)
  
  useEffect(() => {

    if (typeof window !== 'undefined') {
      const PIXI = require('pixi.js'); // Dynamically load PIXI

    window.PIXI = PIXI

    Live2DModel.registerTicker(PIXI.Ticker)

    const app = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      resizeTo: window,
    })

    Live2DModel.from('/runtime/rice_pro_t03.model3.json').then((model) => {
      app.stage.addChild(model)

      model.anchor.set(0.6, 0.4)
      model.position.set(window.innerWidth / 2, window.innerHeight / 2)
      model.scale.set(0.5, 0.5)

      model.on('hit', () => {
        model.motion('Tap@Body')
      })
    })
    console.log(window.Live2D)
  }
  }, [])

  return (
    <div>
      <Script src="/live2dcubismcore.min.js" />
      <canvas id="canvas" ref={canvasRef} />    
    </div>
)
}

export default V