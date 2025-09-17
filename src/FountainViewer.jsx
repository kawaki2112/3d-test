import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

function FountainModel() {
  const { scene } = useGLTF('/models/psg_fountain.glb');
  return <primitive object={scene} scale={0.6} />;
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
      camera={{ position: [90, 90, 90], fov: 45 }}
    >
      <SceneBackground />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls 
        maxPolarAngle={Math.PI * 0.75} // Prevents rotating too far down
        minPolarAngle={Math.PI * 0.1}  // Prevents rotating too far up
        enableDamping={true}
        dampingFactor={0.05}
      />
      <FountainModel />
    </Canvas>
  );
}
