import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

function FountainModel() {
  const { scene } = useGLTF('/models/psg_fountain.glb');
  return <primitive object={scene} scale={0.6} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
}

function SceneBackground() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Set background color using Three.js
    scene.background = new THREE.Color('#f0f0f0'); // Half-white
    
    return () => {
      scene.background = null;
    };
  }, [scene]);
  
  return null;
}

export default function FountainViewer() {
  return (
    <Canvas 
      camera={{ position: [45, 30, 45], fov: 45 }} // Better angle
    >
      <SceneBackground />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls 
        maxPolarAngle={Math.PI * 0.6} // Prevents extreme downward rotation
        minPolarAngle={Math.PI * 0.2}  // Prevents extreme upward rotation
        enableDamping={true}
        dampingFactor={0.05}
        target={[0, 5, 0]} // Focus point slightly above ground
      />
      <FountainModel />
    </Canvas>
  );
}
