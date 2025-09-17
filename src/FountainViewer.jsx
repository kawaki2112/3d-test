import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function FountainModel() {
  const { scene } = useGLTF('/models/psg_fountain.glb');
  return <primitive object={scene} scale={0.6} position={[0, 0, 0]} />;
}

function SceneBackground() {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color('#f0f0f0');
    return () => {
      scene.background = null;
    };
  }, [scene]);
  
  return null;
}

function FPSMovement({ bounds = 50 }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const [keys, setKeys] = useState({});

  // Movement bounds (cube around fountain)
  const minBound = -bounds;
  const maxBound = bounds;
  const minY = 2;  // Minimum height above ground
  const maxY = 40; // Maximum height

  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.code]: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!controlsRef.current || !controlsRef.current.isLocked) return;

    // Reset velocity
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;
    velocity.current.y -= velocity.current.y * 10.0 * delta;

    // Movement speed
    const speed = keys.ShiftLeft ? 25 : 15; // Run with shift

    direction.current.set(0, 0, 0);

    // WASD movement
    if (keys.KeyW) direction.current.z = -1;
    if (keys.KeyS) direction.current.z = 1;
    if (keys.KeyA) direction.current.x = -1;
    if (keys.KeyD) direction.current.x = 1;
    if (keys.Space) direction.current.y = 1;
    if (keys.KeyC) direction.current.y = -1; // Crouch/down

    // Apply movement
    if (keys.KeyW || keys.KeyS) velocity.current.z -= direction.current.z * speed * delta;
    if (keys.KeyA || keys.KeyD) velocity.current.x -= direction.current.x * speed * delta;
    if (keys.Space || keys.KeyC) velocity.current.y += direction.current.y * speed * delta;

    // Get current position
    const currentPos = camera.position.clone();
    
    // Apply velocity
    controlsRef.current.moveRight(-velocity.current.x * delta);
    controlsRef.current.moveForward(-velocity.current.z * delta);
    
    // Manual Y movement (up/down)
    camera.position.y += velocity.current.y * delta;

    // Apply boundaries
    camera.position.x = Math.max(minBound, Math.min(maxBound, camera.position.x));
    camera.position.z = Math.max(minBound, Math.min(maxBound, camera.position.z));
    camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
  });

  return (
    <PointerLockControls 
      ref={controlsRef}
      args={[camera, gl.domElement]}
    />
  );
}

// Instructions overlay
function Instructions() {
  const [show, setShow] = useState(true);
  
  if (!show) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      zIndex: 1000,
      maxWidth: '250px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>FPS Controls:</div>
      <div>Click to lock cursor</div>
      <div>WASD - Move</div>
      <div>Space - Up</div>
      <div>C - Down</div>
      <div>Shift - Run</div>
      <div>ESC - Exit</div>
      <button 
        onClick={() => setShow(false)}
        style={{
          marginTop: '10px',
          padding: '4px 8px',
          background: '#444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Hide
      </button>
    </div>
  );
}

export default function FountainViewer() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Instructions />
      <Canvas 
        camera={{ position: [20, 15, 20], fov: 75 }}
      >
        <SceneBackground />
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 50, 25]} intensity={1} />
        <directionalLight position={[-50, 20, -25]} intensity={0.5} />
        
        <FPSMovement bounds={40} />
        <FountainModel />
        
        {/* Visual boundary indicators */}
        <mesh position={[0, 1, 40]} visible={false}>
          <boxGeometry args={[80, 2, 0.1]} />
          <meshBasicMaterial color="red" opacity={0.3} transparent />
        </mesh>
      </Canvas>
    </div>
  );
}
