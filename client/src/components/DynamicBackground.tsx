import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { Phase } from '../types/gameTypes';

interface DynamicBackgroundProps {
  intensity?: number; // Controls the intensity of the effects (0-1)
  interactive?: boolean; // Whether the background reacts to mouse movement
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  intensity = 0.5,
  interactive = true,
}) => {
  const { currentPhase, isTransitioning, phaseChangeCount } = useTheme();
  
  // Mouse position tracking for interactivity
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Refs for animation containers
  const containerRef = useRef<HTMLDivElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Refs for THREE.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointsRef = useRef<THREE.BufferGeometry | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Track window dimensions for responsive design
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      if (cameraRef.current && rendererRef.current) {
        const camera = cameraRef.current as THREE.PerspectiveCamera;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle mouse movement for interactive effects
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);
  
  // Initialize and manage THREE.js scene
  useEffect(() => {
    if (!threeContainerRef.current) return;
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 20;
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (threeContainerRef.current.firstChild) {
      threeContainerRef.current.removeChild(threeContainerRef.current.firstChild);
    }
    threeContainerRef.current.appendChild(renderer.domElement);
    
    // Create particles based on phase
    const initParticles = () => {
      if (!scene) return;
      
      // Remove existing particles
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
      }
      
      // Set up particles based on current phase
      let particleCount = 2000;
      let particleColor: THREE.Color;
      let particleSize = 0.05 + (intensity * 0.05);
      let speedFactor = 0.005 + (intensity * 0.01);
      
      switch (currentPhase) {
        case Phase.BloodMoon:
          particleColor = new THREE.Color(0xff3333);
          particleCount = 2500;
          speedFactor = 0.01 + (intensity * 0.015);
          break;
        case Phase.Void:
          particleColor = new THREE.Color(0x9933ff);
          particleCount = 2200;
          speedFactor = 0.008 + (intensity * 0.01);
          break;
        case Phase.Normal:
        default:
          particleColor = new THREE.Color(0x33ff99);
          particleCount = 1800;
          speedFactor = 0.005 + (intensity * 0.008);
      }
      
      // Create particles
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      for (let i = 0; i < particleCount; i++) {
        // Distribute particles throughout the scene in a semi-spherical pattern
        const radius = 5 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Color variation for more natural look
        colors[i * 3] = particleColor.r + (Math.random() * 0.2 - 0.1);
        colors[i * 3 + 1] = particleColor.g + (Math.random() * 0.2 - 0.1);
        colors[i * 3 + 2] = particleColor.b + (Math.random() * 0.2 - 0.1);
        
        // Random particle sizes for depth effect
        sizes[i] = particleSize * (0.5 + Math.random() * 0.8);
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // Create particle material with custom shader
      const material = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      
      // Create particle system and add to scene
      const particleSystem = new THREE.Points(particles, material);
      scene.add(particleSystem);
      
      // Store references
      particlesRef.current = particleSystem;
      pointsRef.current = particles;
      
      return { particleCount, speedFactor };
    };
    
    const { particleCount, speedFactor } = initParticles() || { particleCount: 2000, speedFactor: 0.005 };
    
    // Animation function
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (particlesRef.current && pointsRef.current) {
        // Rotate the particle system slowly
        particlesRef.current.rotation.y += 0.0005;
        
        // Add interactive movement based on mouse position if enabled
        if (interactive) {
          particlesRef.current.rotation.x += mousePosition.y * 0.0001;
          particlesRef.current.rotation.y += mousePosition.x * 0.0001;
        }
        
        // Update particle positions based on current phase
        const positions = pointsRef.current.attributes.position.array as Float32Array;
        
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          
          switch (currentPhase) {
            case Phase.BloodMoon:
              // Blood Moon - pulsating movement
              positions[idx] *= 1 + Math.sin(Date.now() * 0.001) * 0.002;
              positions[idx+1] *= 1 + Math.sin(Date.now() * 0.002) * 0.002;
              positions[idx+2] *= 1 + Math.sin(Date.now() * 0.003) * 0.002;
              
              // Subtle drift
              positions[idx] += (Math.random() - 0.5) * speedFactor * 0.5;
              positions[idx+1] += (Math.random() - 0.5) * speedFactor * 0.5;
              positions[idx+2] += (Math.random() - 0.5) * speedFactor * 0.3;
              break;
              
            case Phase.Void:
              // Void - swirling movement
              const angle = Date.now() * 0.0005;
              const radius = Math.sqrt(positions[idx]**2 + positions[idx+1]**2);
              if (radius > 0.1) { // Avoid division by zero
                positions[idx] = Math.cos(angle + i * 0.01) * radius;
                positions[idx+1] = Math.sin(angle + i * 0.01) * radius;
              }
              
              // Add some randomness to z-axis
              positions[idx+2] += (Math.random() - 0.5) * speedFactor * 0.8;
              break;
              
            case Phase.Normal:
            default:
              // Normal - gentle flow with some order
              positions[idx] += Math.sin(i + Date.now() * 0.001) * speedFactor * 0.3;
              positions[idx+1] += Math.cos(i + Date.now() * 0.001) * speedFactor * 0.3;
              positions[idx+2] += (Math.random() - 0.5) * speedFactor * 0.2;
          }
          
          // Keep particles within bounds
          const dist = Math.sqrt(positions[idx]**2 + positions[idx+1]**2 + positions[idx+2]**2);
          if (dist > 20) {
            positions[idx] *= 0.95;
            positions[idx+1] *= 0.95;
            positions[idx+2] *= 0.95;
          }
        }
        
        pointsRef.current.attributes.position.needsUpdate = true;
      }
      
      // Render the scene
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate();
    
    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    
    // Clean up function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (threeContainerRef.current && threeContainerRef.current.firstChild) {
        threeContainerRef.current.removeChild(threeContainerRef.current.firstChild);
      }
    };
  }, [currentPhase, dimensions, phaseChangeCount, intensity]);
  
  // Initialize and manage SVG lightning effects (for Void phase)
  useEffect(() => {
    if (!svgContainerRef.current) return;
    if (currentPhase !== Phase.Void) {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
      return;
    }
    
    // Generate SVG lightning bolts
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const createLightningPath = () => {
      const startX = width * (Math.random() * 0.8 + 0.1); // Between 10-90% of width
      const startY = -20; // Start above the screen
      let path = `M${startX},${startY} `;
      
      let x = startX;
      let y = startY;
      
      // Create lightning segments
      const segments = 4 + Math.floor(Math.random() * 5);
      const maxHeight = height * 0.7; // Limit to top 70% of screen
      
      for (let i = 1; i < segments; i++) {
        const newY = startY + (maxHeight) * (i / segments);
        const newX = startX + (Math.random() * width * 0.4 - width * 0.2);
        
        path += `L${newX},${newY} `;
        x = newX;
        y = newY;
      }
      
      return path;
    };
    
    const createLightningBolt = () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
      svg.setAttribute('class', 'absolute top-0 left-0 pointer-events-none');
      
      const lightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      lightning.setAttribute('d', createLightningPath());
      lightning.setAttribute('stroke', '#a855f7');
      lightning.setAttribute('stroke-width', (1 + Math.random() * 1.5).toString());
      lightning.setAttribute('fill', 'none');
      lightning.setAttribute('stroke-opacity', (0.3 + Math.random() * 0.3).toString());
      lightning.setAttribute('style', 'filter: drop-shadow(0 0 3px #a855f7)');
      
      // Animation with random timing for natural effect
      const animate = () => {
        lightning.setAttribute('d', createLightningPath());
        lightning.setAttribute('stroke-width', (1 + Math.random() * 1.5).toString());
        lightning.setAttribute('stroke-opacity', (0.3 + Math.random() * 0.3).toString());
        setTimeout(animate, 300 + Math.random() * 1000);
      };
      
      svg.appendChild(lightning);
      
      if (svgContainerRef.current) {
        svgContainerRef.current.appendChild(svg);
      }
      
      setTimeout(animate, 200);
    };
    
    // Clear existing content
    if (svgContainerRef.current) {
      svgContainerRef.current.innerHTML = '';
    }
    
    // Create multiple lightning bolts
    const boltCount = 3 + Math.floor(intensity * 5);
    for (let i = 0; i < boltCount; i++) {
      setTimeout(() => createLightningBolt(), i * 300);
    }
    
    // Cleanup function
    return () => {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
    };
  }, [currentPhase, dimensions, phaseChangeCount, intensity]);
  
  // Initialize and manage canvas-based fire effects (for BloodMoon phase)
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    if (currentPhase !== Phase.BloodMoon) {
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
      return;
    }
    
    // Create canvas for fire effect
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.className = 'absolute top-0 left-0 pointer-events-none';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear existing content
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = '';
      canvasContainerRef.current.appendChild(canvas);
    }
    
    // Fire particles
    interface FireParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      decay: number;
    }
    
    const particles: FireParticle[] = [];
    
    // Create particles at the bottom of the screen
    const createParticles = () => {
      const particleCount = 3 + Math.floor(intensity * 5);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 20,
          vx: Math.random() * 2 - 1,
          vy: -2 - Math.random() * 3 - intensity * 2,
          radius: 10 + Math.random() * 20 + intensity * 20,
          alpha: 0.3 + Math.random() * 0.3,
          decay: 0.01 + Math.random() * 0.01
        });
      }
    };
    
    // Animation loop
    const animate = () => {
      if (!ctx) return;
      
      // Apply semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create new particles
      createParticles();
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.radius *= 0.99;
        
        // Remove dead particles
        if (p.alpha <= 0 || p.radius <= 1) {
          particles.splice(i, 1);
          i--;
          continue;
        }
        
        // Create fire gradient
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(255, 50, 0, ${p.alpha})`);
        gradient.addColorStop(0.4, `rgba(255, 100, 0, ${p.alpha * 0.6})`);
        gradient.addColorStop(0.8, `rgba(255, 50, 0, ${p.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    const animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
    };
  }, [currentPhase, dimensions, phaseChangeCount, intensity]);
  
  // Render the background container with all effect layers
  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0"
      style={{ 
        background: getPhaseBackground(currentPhase),
        transition: 'background 1.5s ease-in-out' 
      }}
    >
      {/* Phase-specific overlay gradient */}
      <div 
        className="absolute inset-0 opacity-50 transition-opacity duration-1500"
        style={{ background: getPhaseGradient(currentPhase) }}
      />
      
      {/* THREE.js particle container */}
      <div ref={threeContainerRef} className="absolute inset-0" />
      
      {/* SVG lightning effects container (for Void phase) */}
      <div ref={svgContainerRef} className="absolute inset-0 overflow-visible" />
      
      {/* Canvas fire effects container (for BloodMoon phase) */}
      <div ref={canvasContainerRef} className="absolute inset-0 overflow-visible" />
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/50 pointer-events-none" />
      
      {/* Phase transition flash */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
      )}
    </div>
  );
};

// Helper functions for phase-specific styling
const getPhaseBackground = (phase: Phase): string => {
  switch (phase) {
    case Phase.BloodMoon:
      return 'radial-gradient(circle, #300, #200, #100)';
    case Phase.Void:
      return 'radial-gradient(circle, #20073a, #150533, #10042b)';
    case Phase.Normal:
    default:
      return 'radial-gradient(circle, #002718, #001c10, #001208)';
  }
};

const getPhaseGradient = (phase: Phase): string => {
  switch (phase) {
    case Phase.BloodMoon:
      return 'linear-gradient(to bottom, rgba(255,0,0,0.1), rgba(100,0,0,0.2))';
    case Phase.Void:
      return 'linear-gradient(to bottom, rgba(138,43,226,0.1), rgba(75,0,130,0.2))';
    case Phase.Normal:
    default:
      return 'linear-gradient(to bottom, rgba(0,255,127,0.05), rgba(0,100,50,0.1))';
  }
};

export default DynamicBackground; 