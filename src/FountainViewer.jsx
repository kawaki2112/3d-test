import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function FountainModel() {
  const { scene } = useGLTF('/models/psg_fountain.glb');
  return <primitive object={scene} scale={0.6} />;
}

export default function FountainViewer() {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls />
      <FountainModel />
    </Canvas>
  );
}