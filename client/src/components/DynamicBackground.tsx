import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { Phase } from '../types/gameTypes';

interface DynamicBackgroundProps {
  intensity?: number; // Controls the intensity of the effects (0-1)
  interactive?: boolean; // Whether the background reacts to mouse movement
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  intensity = 0.5,
  interactive = false, // Default to false - disable interactivity by default
}) => {
  const { currentPhase, isTransitioning, phaseChangeCount } = useTheme();
  
  // Mouse position tracking for interactivity - still track but won't use for rendering
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

  // Memoize the resize handler to prevent recreation on each render
  const handleResize = useCallback(() => {
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
  }, []);
  
  // Handle window resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  // Memoize the mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    });
  }, []);
  
  // Handle mouse movement for interactive effects
  useEffect(() => {
    if (!interactive) return;
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, handleMouseMove]);
  
  // Helper functions for phase-specific styling memoized
  const getPhaseBackground = useCallback((phase: Phase): string => {
    switch (phase) {
      case Phase.BloodMoon:
        return 'radial-gradient(circle, #300, #200, #100)';
      case Phase.Void:
        return 'radial-gradient(circle, #20073a, #150533, #10042b)';
      case Phase.Normal:
      default:
        // Remove green tint, use dark blue/black instead
        return 'radial-gradient(circle, #0a1018, #060a10, #030508)';
    }
  }, []);

  const getPhaseGradient = useCallback((phase: Phase): string => {
    switch (phase) {
      case Phase.BloodMoon:
        return 'linear-gradient(to bottom, rgba(255,0,0,0.1), rgba(100,0,0,0.2))';
      case Phase.Void:
        return 'linear-gradient(to bottom, rgba(138,43,226,0.1), rgba(75,0,130,0.2))';
      case Phase.Normal:
      default:
        // Remove green tint, use neutral dark overlay
        return 'linear-gradient(to bottom, rgba(10,15,25,0.05), rgba(5,10,15,0.1))';
    }
  }, []);
  
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
      let particleCount = 1200; // Reduced base particle count
      let particleColor: THREE.Color;
      let particleSize = 0.03 + (intensity * 0.04);
      let speedFactor = 0.003 + (intensity * 0.005); // Slower animation
      
      switch (currentPhase) {
        case Phase.BloodMoon:
          particleColor = new THREE.Color(0xff3333);
          particleCount = 900; // Significantly reduced
          speedFactor = 0.005 + (intensity * 0.01);
          break;
        case Phase.Void:
          particleColor = new THREE.Color(0x9933ff);
          particleCount = 800; // Significantly reduced
          speedFactor = 0.004 + (intensity * 0.008);
          break;
        case Phase.Normal:
        default:
          particleColor = new THREE.Color(0xf0f4ff);
          particleCount = 600; // Significantly reduced
          speedFactor = 0.003 + (intensity * 0.005);
          particleSize = 0.02 + (intensity * 0.03);
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
        if (currentPhase === Phase.Normal) {
          // Northern Lights colors - cyan, blue, violet, with some white
          const colorSet = [
            [0.7, 0.9, 1.0],  // Light cyan-blue
            [0.3, 0.6, 0.95], // Deeper blue
            [0.5, 0.3, 0.9],  // Purple-blue
            [0.95, 0.95, 1.0] // Near-white
          ];
          
          // Select a random color from our Northern Lights palette
          const selectedColor = colorSet[Math.floor(Math.random() * colorSet.length)];
          colors[i * 3] = selectedColor[0];     // R
          colors[i * 3 + 1] = selectedColor[1]; // G
          colors[i * 3 + 2] = selectedColor[2]; // B
        } else {
          colors[i * 3] = particleColor.r + (Math.random() * 0.2 - 0.1);
          colors[i * 3 + 1] = particleColor.g + (Math.random() * 0.2 - 0.1);
          colors[i * 3 + 2] = particleColor.b + (Math.random() * 0.2 - 0.1);
        }
        
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
        opacity: currentPhase === Phase.Normal ? 0.5 : 0.7,
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
        // Rotate the particle system slowly - reduced rotation speed
        particlesRef.current.rotation.y += 0.0002;
        
        // Remove interactive movement based on mouse position - no longer using this
        // This avoids the background changing on mouse hover
        
        // Only update a subset of particles each frame to improve performance
        const positions = pointsRef.current.attributes.position.array as Float32Array;
        const updateCount = Math.min(particleCount, 200); // Only update up to 200 particles per frame
        const startIdx = Math.floor(Math.random() * (particleCount - updateCount));
        
        for (let i = 0; i < updateCount; i++) {
          const particleIdx = startIdx + i;
          const idx = particleIdx * 3;
          
          switch (currentPhase) {
            case Phase.BloodMoon:
              // Simplified Blood Moon - pulsating movement
              const pulseFactor = Math.sin(Date.now() * 0.0005) * 0.001;
              positions[idx] *= 1 + pulseFactor;
              positions[idx+1] *= 1 + pulseFactor;
              
              // Very subtle drift
              if (Math.random() < 0.3) { // Only 30% chance to update position each frame
                positions[idx] += (Math.random() - 0.5) * speedFactor * 0.3;
                positions[idx+1] += (Math.random() - 0.5) * speedFactor * 0.3;
              }
              break;
              
            case Phase.Void:
              // Simplified Void movement - less intensive calculation
              if (Math.random() < 0.3) { // Only 30% chance to update position each frame
                const angle = Date.now() * 0.0003;
                const radius = Math.sqrt(positions[idx]**2 + positions[idx+1]**2);
                if (radius > 0.1) {
                  positions[idx] = Math.cos(angle + particleIdx * 0.01) * radius;
                  positions[idx+1] = Math.sin(angle + particleIdx * 0.01) * radius;
                }
              }
              break;
              
            case Phase.Normal:
            default:
              // Simplified Normal movement - very minimal updates
              if (Math.random() < 0.2) { // Only 20% chance to update position each frame
                positions[idx] += Math.sin(particleIdx + Date.now() * 0.0002) * speedFactor * 0.1;
                positions[idx+1] += Math.cos(particleIdx + Date.now() * 0.0002) * speedFactor * 0.1;
              }
          }
          
          // Keep particles within bounds - simplified calculation
          if (Math.random() < 0.1) { // Only check bounds 10% of the time
            const dist = Math.sqrt(positions[idx]**2 + positions[idx+1]**2 + positions[idx+2]**2);
            if (dist > 20) {
              positions[idx] *= 0.95;
              positions[idx+1] *= 0.95;
              positions[idx+2] *= 0.95;
            }
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
  
  // Memoize SVG lightning creation functions
  const createLightningPath = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // More realistic lightning pattern with branches
    const startX = width * (0.3 + Math.random() * 0.4); // More centered
    const startY = -10; // Start just above the screen
    
    // Calculate endpoints more naturally - lightning mostly goes downward
    const endX = startX + (Math.random() * width * 0.3 - width * 0.15);
    const endY = height * (0.3 + Math.random() * 0.3); // End in upper half of screen
    
    let path = `M${startX},${startY} `;
    
    let currentX = startX;
    let currentY = startY;
    
    // Main lightning bolt with more natural zigzag
    const segments = 6 + Math.floor(Math.random() * 4);
    const mainDisplacement = width * 0.03; // Smaller displacement for main path
    
    for (let i = 1; i <= segments; i++) {
      // Calculate progress along the path (0 to 1)
      const progress = i / segments;
      
      // Interpolate between start and end points
      const targetX = startX + (endX - startX) * progress;
      const targetY = startY + (endY - startY) * progress;
      
      // Add some randomness, but ensure general downward direction
      const newX = targetX + (Math.random() * mainDisplacement * 2 - mainDisplacement);
      const newY = targetY;
      
      path += `L${newX},${newY} `;
      
      // Add smaller branches with some probability
      if (i > 1 && i < segments - 1 && Math.random() < 0.3) {
        // Create a small branch
        const branchLength = height * (0.05 + Math.random() * 0.1);
        const branchAngle = Math.PI * (0.3 + Math.random() * 0.4); // Mostly downward
        const branchEndX = newX + Math.cos(branchAngle) * branchLength;
        const branchEndY = newY + Math.sin(branchAngle) * branchLength;
        
        // Add branch segment
        path += `M${newX},${newY} L${branchEndX},${branchEndY} M${newX},${newY} `;
      }
      
      currentX = newX;
      currentY = newY;
    }
    
    return path;
  }, []);
  
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
    
    const createLightningBolt = () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
      svg.setAttribute('class', 'absolute top-0 left-0 pointer-events-none');
      
      // Create the main lightning path
      const lightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      lightning.setAttribute('d', createLightningPath());
      
      // More realistic purple color with slight variation
      const hue = 270 + Math.floor(Math.random() * 40 - 20); // Purple range
      const lightningColor = `hsl(${hue}, 100%, ${70 + Math.random() * 20}%)`;
      
      lightning.setAttribute('stroke', lightningColor);
      lightning.setAttribute('stroke-width', (1 + Math.random() * 1).toString()); // Thinner stroke
      lightning.setAttribute('fill', 'none');
      lightning.setAttribute('stroke-opacity', (0.7 + Math.random() * 0.3).toString());
      
      // Add glow effect for more realistic lightning
      const glow = `drop-shadow(0 0 ${3 + Math.random() * 2}px ${lightningColor})`;
      lightning.setAttribute('style', `filter: ${glow}`);
      
      // Animation with random timing for natural effect - slower fade
      const fadeOut = () => {
        let opacity = parseFloat(lightning.getAttribute('stroke-opacity') || '1');
        opacity *= 0.92; // Slower fade
        
        if (opacity > 0.05) {
          lightning.setAttribute('stroke-opacity', opacity.toString());
          requestAnimationFrame(fadeOut);
        } else {
          // Remove and create new bolt after a longer pause
          if (svg.parentNode) {
            svg.parentNode.removeChild(svg);
          }
          
          // Longer delay between lightning bolts
          setTimeout(() => {
            if (svgContainerRef.current && currentPhase === Phase.Void) {
              createLightningBolt();
            }
          }, 2000 + Math.random() * 3000); // 2-5 second delay between bolts
        }
      };
      
      // Add flicker effect for more realism
      const flicker = () => {
        const flickerCount = Math.floor(Math.random() * 3) + 2;
        let currentFlicker = 0;
        
        const doFlicker = () => {
          if (currentFlicker < flickerCount) {
            const opacity = 0.7 + Math.random() * 0.3;
            lightning.setAttribute('stroke-opacity', opacity.toString());
            
            setTimeout(doFlicker, 50 + Math.random() * 30);
            currentFlicker++;
          } else {
            // After flickering, start fade out
            setTimeout(fadeOut, 100 + Math.random() * 200);
          }
        };
        
        doFlicker();
      };
      
      svg.appendChild(lightning);
      
      if (svgContainerRef.current) {
        svgContainerRef.current.appendChild(svg);
      }
      
      // Start flicker effect
      setTimeout(flicker, 50);
    };
    
    // Clear existing content
    if (svgContainerRef.current) {
      svgContainerRef.current.innerHTML = '';
    }
    
    // Create just a single lightning bolt
    createLightningBolt();
    
    // Cleanup function
    return () => {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
    };
  }, [currentPhase, dimensions, phaseChangeCount, intensity, createLightningPath]);
  
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
      const particleCount = 2 + Math.floor(intensity * 3);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 20,
          vx: Math.random() * 2 - 1,
          vy: -2 - Math.random() * 3 - intensity * 2,
          radius: 8 + Math.random() * 12 + intensity * 10, // Smaller fire particles
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
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/30 pointer-events-none" />
      
      {/* Phase transition flash */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
      )}
    </div>
  );
};

export default DynamicBackground; 