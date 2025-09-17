import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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

function MobileFPSControls({ bounds = 40, movement, touchRotation }) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  
  const minBound = -bounds;
  const maxBound = bounds;
  const minY = 2;
  const maxY = 40;

  useFrame((state, delta) => {
    // Apply touch rotation
    euler.current.setFromQuaternion(camera.quaternion);
    euler.current.y = touchRotation.y;
    euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, touchRotation.x));
    camera.quaternion.setFromEuler(euler.current);
    
    // Movement
    velocity.current.x -= velocity.current.x * 8.0 * delta;
    velocity.current.z -= velocity.current.z * 8.0 * delta;
    velocity.current.y -= velocity.current.y * 8.0 * delta;

    const speed = 40; // Increased speed

    if (movement.forward) velocity.current.z = speed;
    if (movement.backward) velocity.current.z = -speed;
    if (movement.left) velocity.current.x = -speed;
    if (movement.right) velocity.current.x = speed;
    if (movement.up) velocity.current.y = speed;
    if (movement.down) velocity.current.y = -speed;

    // Move relative to camera direction
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    camera.position.add(forward.multiplyScalar(velocity.current.z * delta));
    camera.position.add(right.multiplyScalar(velocity.current.x * delta));
    camera.position.y += velocity.current.y * delta;

    // Apply boundaries
    camera.position.x = Math.max(minBound, Math.min(maxBound, camera.position.x));
    camera.position.z = Math.max(minBound, Math.min(maxBound, camera.position.z));
    camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
  });

  return null;
}

function MobileControls({ onMove }) {
  const buttonStyle = {
    width: '60px',
    height: '60px',
    border: 'none',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.8)',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  };

  const handleStart = (direction) => {
    onMove(prev => ({ ...prev, [direction]: true }));
  };

  const handleEnd = (direction) => {
    onMove(prev => ({ ...prev, [direction]: false }));
  };

  return (
    <>
      {/* Movement pad - bottom left */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'grid',
        gridTemplate: '60px 60px 60px / 60px 60px 60px',
        gap: '10px',
        zIndex: 1000
      }}>
        <div></div>
        <button
          style={buttonStyle}
          onTouchStart={() => handleStart('forward')}
          onTouchEnd={() => handleEnd('forward')}
          onMouseDown={() => handleStart('forward')}
          onMouseUp={() => handleEnd('forward')}
        >↑</button>
        <div></div>
        
        <button
          style={buttonStyle}
          onTouchStart={() => handleStart('left')}
          onTouchEnd={() => handleEnd('left')}
          onMouseDown={() => handleStart('left')}
          onMouseUp={() => handleEnd('left')}
        >←</button>
        <div></div>
        <button
          style={buttonStyle}
          onTouchStart={() => handleStart('right')}
          onTouchEnd={() => handleEnd('right')}
          onMouseDown={() => handleStart('right')}
          onMouseUp={() => handleEnd('right')}
        >→</button>
        
        <div></div>
        <button
          style={buttonStyle}
          onTouchStart={() => handleStart('backward')}
          onTouchEnd={() => handleEnd('backward')}
          onMouseDown={() => handleStart('backward')}
          onMouseUp={() => handleEnd('backward')}
        >↓</button>
        <div></div>
      </div>

      {/* Vertical controls - bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        zIndex: 1000
      }}>
        <button
          style={buttonStyle}
          onTouchStart={() => handleStart('up')}
          onTouchEnd={() => handleEnd('up')}
          onMouseDown={() => handleStart('up')}
          onMouseUp={() => handleEnd('up')}
        >⬆</button>
        <button
          style={buttonStyle}
          onTouchStart={() => handleStart('down')}
          onTouchEnd={() => handleEnd('down')}
          onMouseDown={() => handleStart('down')}
          onMouseUp={() => handleEnd('down')}
        >⬇</button>
      </div>
    </>
  );
}

export default function FountainViewer() {
  const [movement, setMovement] = useState({});
  const [touchRotation, setTouchRotation] = useState({ x: 0, y: 0 });
  const lastTouch = useRef({ x: 0, y: 0 });
  
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouch.current.x;
      const deltaY = touch.clientY - lastTouch.current.y;
      const sensitivity = 0.005;
      
      setTouchRotation(prev => ({
        x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.x - deltaY * sensitivity)), // Only Y rotation (up/down look)
        y: prev.y - deltaX * sensitivity // Only X rotation (left/right look)
      }));
      
      lastTouch.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas 
        camera={{ position: [20, 15, 20], fov: 75 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{ touchAction: 'none' }}
      >
        <SceneBackground />
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 50, 25]} intensity={1} />
        <directionalLight position={[-50, 20, -25]} intensity={0.5} />
        
        <MobileFPSControls bounds={40} movement={movement} touchRotation={touchRotation} />
        <FountainModel />
      </Canvas>
      
      <MobileControls onMove={setMovement} />
    </div>
  );
}
