"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ModelViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mountRef.current) {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      scene.background = new THREE.Color(0xFFFFFF); // Set background color to white

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);



      // Load the model (replace 'waifu.glb' with your actual file path)
      const loader = new GLTFLoader();
      let waifuModel, mixer:any;
      
      // Load the model (replace 'waifu.glb' with your actual file path)
      loader.load('/waifu.glb', function (gltf:any) {
          waifuModel = gltf.scene;
          scene.add(waifuModel);
      
          // Check if the model has animations
          if (gltf.animations && gltf.animations.length) {
              mixer = new THREE.AnimationMixer(waifuModel);
      
              // Add all animations in the GLB
              gltf.animations.forEach((clip:any) => {
                  mixer.clipAction(clip).play();
              });
          }
      
          // Set the camera position to look at the model
          camera.position.set(5, 5, 5);
          camera.lookAt(waifuModel.position);
      });

      // Camera setup
      camera.position.z = 1;

      const angle = Math.PI / 2; // 90 degrees in radians


      // Resize handling
      const onWindowResize = () => {
        if (mountRef.current) {
          camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        }
      };

      window.addEventListener("resize", onWindowResize);

      // Render loop
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };

      animate();

      // Cleanup on unmount
      return () => {
        window.removeEventListener("resize", onWindowResize);
        renderer.dispose();
      };
    }
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default ModelViewer;