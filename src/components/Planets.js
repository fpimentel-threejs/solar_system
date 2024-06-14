import data from '../planets.json';
import { useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useTexture } from '@react-three/drei';
import { Camera } from 'three';
import * as THREE from 'three';

export default function Planets(props) {
  // Refs
  const groupsRef = useRef([]);
  const planetsRef = useRef([]);
  const htmlRef = useRef([]);
  const ringsRef = useRef([]);

  // State
  const [tooFar, setTooFar] = useState(false);

  // Data Fetching
  useEffect(() => {
    async function fetchPlanetaryData() {
      const apiKey = '6qaJHFKo2G7raUYrdOyK44HzjH7eB5RG9JNAqAEf'; 
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
      const data = await response.json();
      return data;
    }
    
    fetchPlanetaryData().then(data => {
      console.log(data);
    });
  }, []); // Empty dependency array ensures the effect runs once

  // Helper Functions
  const loader = new THREE.TextureLoader();

  function createRing(innerradius, outerradius) {
    const geometry = new THREE.RingBufferGeometry(innerradius, outerradius, 64, 32);
    let pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    let v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const length = v3.length();
      const t = (length - innerradius) / (outerradius - innerradius);
      uv.setXY(i, t, 1);
    }
    return geometry;
  }

  const thickFactor = 0.5;

  function planetClick(planet, index) {
    /*data.planets.forEach((planet) => (planet.active = false));
    planet.active = true;
    console.log(data.planets);*/
  }

  // useFrame for Animation
  useFrame((state) => {
    planetsRef.current.forEach((planet, index) => {
      const planetData = data.planets[index];

      // Rotate the planet on its axis
      planet.rotation.y += planetData.rotation_speed; 

      // If the planet is active (selected by the user), move the camera to it
      if (planetData.active) {
        const target = new THREE.Vector3();
        planet.getWorldPosition(target);

        const offset = new THREE.Vector3(20, 0, 0); 

        // Smoothly move the camera to the new position with a lerp (linear interpolation)
        state.camera.position.lerp(target.add(offset), 0.1); 
        state.camera.lookAt(target);
      }
    });

    // Rotate the planet groups (orbits)
    groupsRef.current.forEach((group, index) => {
      group.rotation.y += data.planets[index].orbit_speed * 0.01;
    });

    // Adjust planet labels (HTML elements) based on camera distance
    htmlRef.current.forEach((html, index) => {
      html.lookAt(state.camera.position);
      const scalar = state.camera.position.distanceTo(html.position) * 0.05;
      html.scale.set(scalar, scalar, scalar);

      // Only show the label if it's close enough to the camera
      html.visible = scalar > 0.5; // Example threshold
    });

    // Adjust ring effects based on camera distance
    ringsRef.current.forEach((ring) => {
      ring.lookAt(state.camera.position);
      const scalar = state.camera.position.distanceTo(ring.position) * 0.005 + 0.2;
      ring.scale.set(scalar, scalar, scalar);
    });
  });

  // Planet Rendering
    // ... (planet rendering JSX remains the same)
    const planets = data.planets.map((planet, index) => [ 
        // Using square brackets [] for the arrow function in map
    
        // Ring Mesh (representing the planet's orbit)
        <mesh rotation={[THREE.MathUtils.degToRad(90), 0, 0]} key={`orbit-${index}`}> 
          <ringGeometry
            args={[
              planet.distance_from_sun * 0.0000001 - thickFactor * planet.radius * 0.0001,
              planet.distance_from_sun * 0.0000001 + thickFactor * planet.radius * 0.0001,
              128, 
              32,
            ]}
          />
          <meshBasicMaterial side={THREE.DoubleSide} attach="material" color={planet.color} />
        </mesh>,
    
        // Planet Group (for rotation and positioning)
        <group 
          ref={(el) => (groupsRef.current[index] = el)} 
          key={`group-${index}`}
        >
          {/* Planet Mesh */}
          <mesh
            ref={(el) => (planetsRef.current[index] = el)}
            position={[planet.distance_from_sun * 0.0000001, 0, 0]}
            rotation={[THREE.MathUtils.degToRad(planet.axial_tilt), 0, 0]}
          >
            <sphereGeometry args={[planet.radius * 0.0001, 32, 32]} />
            <meshStandardMaterial attach="material" map={loader.load(`${planet.texture}`)} />
    
            {/* Planet Name Label (HTML Overlay) */}
            <group ref={(el) => (htmlRef.current[index] = el)}>
              <Html transform transparent={true} style={{ display: 'block' }}>
                <div
                  onClick={planetClick.bind(this, planet, index)}
                  className={'planetNames'}
                >
                  <h1 style={{ color: planet.color }}>{planet.name}</h1>
                </div>
              </Html>
            </group>
    
            {/* Rings (if the planet has them) */}
            {planet.rings[0] && (
              <mesh rotation={[THREE.MathUtils.degToRad(90), 0, 0]}>
                <primitive
                  object={createRing(
                    planet.rings[1].innerradius * 0.0001,
                    planet.rings[1].outerradius * 0.0001
                  )}
                  attach="geometry"
                />
                <meshStandardMaterial
                  metalness={0}
                  roughness={1}
                  transparent={true}
                  side={THREE.DoubleSide}
                  attach="material"
                  alphaMap={planet.rings[1].transTexture != null ? loader.load(`${planet.rings[1].transTexture}`) : null}
                  map={loader.load(`${planet.rings[1].texture}`)}
                />
              </mesh>
            )}
    
            {/* Additional Ring Effect */}
            <mesh ref={(el) => (ringsRef.current[index] = el)}>
              <ringGeometry args={[1.25, 1.5, 64, 32]} />
              <meshBasicMaterial side={THREE.DoubleSide} attach="material" color={planet.color} />
            </mesh>
          </mesh>
        </group>,
      ]); // End of map function with square brackets
    
      return <>{planets}</>;
    }