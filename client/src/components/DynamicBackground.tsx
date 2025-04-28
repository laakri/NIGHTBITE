import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { Phase } from '../types/gameTypes';

interface DynamicBackgroundProps {
  intensity?: number; // Controls the intensity of the effects (0-1)
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  intensity = 0.5,
}) => {
  const { currentPhase, isTransitioning, phaseChangeCount } = useTheme();
  
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

  // Create a ref to store the timeout ID
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced resize handler
  const handleResize = useCallback(() => {
    // Debounce resize to run at most every 250ms
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
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
    }, 250);
  }, []);
  
  // Handle window resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);
  
  // Helper functions for phase-specific styling memoized
  const getPhaseBackground = useCallback((phase: Phase): string => {
    switch (phase) {
      case Phase.BloodMoon:
        return 'radial-gradient(circle at center, #500, #400, #300)';
      case Phase.Void:
        return 'radial-gradient(circle, #20073a, #150533, #10042b)';
      case Phase.Normal:
      default:
        return 'radial-gradient(circle, #0a1018, #060a10, #030508)';
    }
  }, []);

  const getPhaseGradient = useCallback((phase: Phase): string => {
    switch (phase) {
      case Phase.BloodMoon:
        return 'linear-gradient(to bottom, rgba(255,0,0,0.2), rgba(170,0,0,0.3))';
      case Phase.Void:
        return 'linear-gradient(to bottom, rgba(138,43,226,0.1), rgba(75,0,130,0.2))';
      case Phase.Normal:
      default:
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
      antialias: false, // Disable antialiasing for performance
      precision: 'mediump', // Medium precision for balance of quality and performance
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Cap pixel ratio for better performance on high-DPI displays
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    
    if (threeContainerRef.current.firstChild) {
      threeContainerRef.current.removeChild(threeContainerRef.current.firstChild);
    }
    threeContainerRef.current.appendChild(renderer.domElement);
    
    // Create particles based on phase - balanced for performance and visuals
    const initParticles = () => {
      if (!scene) return;
      
      // Remove existing particles
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
      }
      
      // Set up particles based on current phase - balanced particle counts
      let particleCount = 600; // Moderate particle count
      let particleColor: THREE.Color;
      let particleSize = 0.04 + (intensity * 0.04);
      
      switch (currentPhase) {
        case Phase.BloodMoon:
          particleColor = new THREE.Color(0xff1a1a);
          particleCount = 800;
          particleSize = 0.06 + (intensity * 0.06); // Larger particles for Blood Moon
          break;
        case Phase.Void:
          particleColor = new THREE.Color(0x9933ff);
          particleCount = 450;
          break;
        case Phase.Normal:
        default:
          particleColor = new THREE.Color(0xf0f4ff);
          particleCount = 400;
      }
      
      // Create particles with interesting visual properties
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const speeds = new Float32Array(particleCount); // For animation
      
      for (let i = 0; i < particleCount; i++) {
        // Distribute particles in a sphere
        const radius = 5 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Color variation for more visual interest
        if (currentPhase === Phase.Normal) {
          // Northern Lights colors
          const colorSet = [
            [0.7, 0.9, 1.0],  // Light cyan-blue
            [0.5, 0.7, 0.95], // Medium blue
            [0.5, 0.3, 0.9],  // Purple-blue
            [0.8, 0.9, 1.0]   // Near-white blue
          ];
          
          const selectedColor = colorSet[Math.floor(Math.random() * colorSet.length)];
          colors[i * 3] = selectedColor[0];
          colors[i * 3 + 1] = selectedColor[1];
          colors[i * 3 + 2] = selectedColor[2];
        } else if (currentPhase === Phase.BloodMoon) {
          // Blood Moon color variations - more vibrant reds and crimsons
          const colorSet = [
            [1.0, 0.1, 0.1],  // Bright red
            [0.9, 0.0, 0.0],  // Pure red
            [0.8, 0.1, 0.1],  // Dark red
            [1.0, 0.2, 0.0],  // Blood orange
            [0.7, 0.0, 0.0]   // Deep crimson
          ];
          
          const selectedColor = colorSet[Math.floor(Math.random() * colorSet.length)];
          colors[i * 3] = selectedColor[0];
          colors[i * 3 + 1] = selectedColor[1];
          colors[i * 3 + 2] = selectedColor[2];
        } else {
          // Add subtle variation to the phase color
          colors[i * 3] = particleColor.r + (Math.random() * 0.2 - 0.1);
          colors[i * 3 + 1] = particleColor.g + (Math.random() * 0.2 - 0.1);
          colors[i * 3 + 2] = particleColor.b + (Math.random() * 0.2 - 0.1);
        }
        
        // Varying particle sizes for depth effect
        sizes[i] = particleSize * (0.5 + Math.random() * 0.8);
        
        // Random animation speeds
        speeds[i] = 0.2 + Math.random() * 0.8;
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // Store speed as a custom attribute
      particles.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
      
      // Create particle material with glow effect
      const material = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      // Create particle system and add to scene
      const particleSystem = new THREE.Points(particles, material);
      scene.add(particleSystem);
      
      // Store references for animation
      particlesRef.current = particleSystem;
      pointsRef.current = particles;
      
      return { particleCount };
    };
    
    initParticles();
    
    // Frame rate limiter for animation
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    
    // Animation variables
    let frameCount = 0;
    
    // Animation function with phase-specific behaviors
    const animate = () => {
      frameCount++;
      
      // Early return if no valid points reference
      if (!pointsRef.current) return;
      
      // Safely access position attribute
      const positionAttribute = pointsRef.current.attributes.position;
      if (!positionAttribute) return;
      
      const positions = positionAttribute.array as Float32Array;
      
      // Safely access speed attribute
      const speedAttribute = pointsRef.current.attributes.speed;
      const speeds = speedAttribute ? speedAttribute.array as Float32Array : null;
      
      // Safely access size attribute
      const sizeAttribute = pointsRef.current.attributes.size;
      if (!sizeAttribute) return;
      
      // Get particle count from the initialized particles
      const particleCount = positions.length / 3;
      const particleSize = sizeAttribute.array[0]; // Get size from the first particle
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
          
        if (currentPhase === Phase.BloodMoon) {
          // Blood Moon - pulsating, swirling movement
          const x = positions[i3];
          const y = positions[i3 + 1];
          const z = positions[i3 + 2];
          
          // Pulse effect - particles move in and out
          const pulseFactor = Math.sin(frameCount * 0.02 + i * 0.1) * 0.15;
          
          // Swirl effect - particles rotate around the y-axis
          // Use speed from array if available, otherwise use default value
          const speed = speeds ? speeds[i] : 0.5;
          const angle = frameCount * 0.002 * speed;
          
          const newX = x * Math.cos(angle) - z * Math.sin(angle);
          const newZ = x * Math.sin(angle) + z * Math.cos(angle);
          
          // Apply movement
          positions[i3] = newX * (1 + pulseFactor);
          positions[i3 + 1] = y * (1 + pulseFactor * 0.5) + Math.sin(frameCount * 0.01 + i) * 0.03;
          positions[i3 + 2] = newZ * (1 + pulseFactor);
          
          // Occasionally create "blood drip" effect for random particles
          if (Math.random() < 0.001) {
            positions[i3 + 1] -= 0.1;
          }
        } else if (currentPhase === Phase.Void) {
          // Void - chaotic, unpredictable movement
          positions[i3] += Math.sin(frameCount * 0.02 + i) * 0.01;
          positions[i3 + 1] += Math.cos(frameCount * 0.03 + i * 2) * 0.01;
          positions[i3 + 2] += Math.sin(frameCount * 0.01 + i * 3) * 0.01;
        } else {
          // Normal - gentle floating
          positions[i3] += Math.sin(frameCount * 0.01 + i) * 0.005;
          positions[i3 + 1] += Math.cos(frameCount * 0.01 + i * 2) * 0.005;
          positions[i3 + 2] += Math.sin(frameCount * 0.01 + i * 3) * 0.005;
              }
          }
          
      // Update particle positions
      positionAttribute.needsUpdate = true;
      
      // Update sizes for pulsing effect in Blood Moon
      if (currentPhase === Phase.BloodMoon && sizeAttribute) {
        const sizes = sizeAttribute.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          sizes[i] = particleSize * (1 + Math.sin(frameCount * 0.05 + i) * 0.3);
            }
        sizeAttribute.needsUpdate = true;
      }
      
      // Render if we have both a renderer and camera
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
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
  }, [currentPhase, phaseChangeCount, intensity]);
  
  // Create more dramatic lightning for Void phase
  useEffect(() => {
    if (!svgContainerRef.current) return;
    if (currentPhase !== Phase.Void) {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
      return;
    }
    
    // Create lightning occasionally or during transitions
    const createLightning = () => {
      // Create SVG for lightning bolt
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', dimensions.width.toString());
      svg.setAttribute('height', dimensions.height.toString());
      svg.setAttribute('class', 'absolute top-0 left-0 pointer-events-none');
      
      // Main lightning path
      const lightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Generate lightning path
      const startX = dimensions.width * (0.3 + Math.random() * 0.4);
      const startY = -10;
      const endX = startX + (Math.random() * dimensions.width * 0.3 - dimensions.width * 0.15);
      const endY = dimensions.height * 0.4;
      
      let path = `M${startX},${startY} `;
      const segments = 6; // More segments for interesting zigzag
      
      for (let i = 1; i <= segments; i++) {
        const progress = i / segments;
        const targetX = startX + (endX - startX) * progress;
        const targetY = startY + (endY - startY) * progress;
        const displacement = 30 * (1 - progress); // More displacement near the top
        const newX = targetX + (Math.random() * displacement * 2 - displacement);
        path += `L${newX},${targetY} `;
        
        // Add branch with 30% chance
        if (i > 1 && i < segments - 1 && Math.random() < 0.3) {
          const branchLength = 20 + Math.random() * 30;
          const branchAngle = Math.PI * (0.3 + Math.random() * 0.4);
          const branchX = newX + Math.cos(branchAngle) * branchLength;
          const branchY = targetY + Math.sin(branchAngle) * branchLength;
          path += `M${newX},${targetY} L${branchX},${branchY} M${newX},${targetY} `;
        }
      }
      
      lightning.setAttribute('d', path);
      
      // Vibrant purple color
      const hue = 270 + Math.floor(Math.random() * 30 - 15);
      const lightningColor = `hsl(${hue}, 100%, ${70 + Math.random() * 20}%)`;
      
      lightning.setAttribute('stroke', lightningColor);
      lightning.setAttribute('stroke-width', '2');
      lightning.setAttribute('fill', 'none');
      lightning.setAttribute('opacity', '0.9');
      
      // Add glow effect
      lightning.setAttribute('filter', `drop-shadow(0 0 5px ${lightningColor})`);
      
      svg.appendChild(lightning);
      
      if (svgContainerRef.current) {
        svgContainerRef.current.appendChild(svg);
      }
      
      // Flash effect
      setTimeout(() => {
        lightning.setAttribute('opacity', '0.6');
        setTimeout(() => {
          lightning.setAttribute('opacity', '0.8');
          setTimeout(() => {
            lightning.setAttribute('opacity', '0.4');
            setTimeout(() => {
              if (svg.parentNode) {
                svg.parentNode.removeChild(svg);
              }
            }, 300);
          }, 100);
        }, 80);
      }, 50);
    };
    
    // Clear existing lightning
    if (svgContainerRef.current) {
      svgContainerRef.current.innerHTML = '';
    }
    
    // Create initial lightning
    createLightning();
    
    // Schedule occasional lightning
    const lightningInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        createLightning();
      }
    }, 3000);
    
    return () => {
      clearInterval(lightningInterval);
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
    };
  }, [currentPhase, dimensions, phaseChangeCount]);
  
  // More dynamic fire effect for BloodMoon phase
  useEffect(() => {
    if (!canvasContainerRef.current || currentPhase !== Phase.BloodMoon) {
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
      return;
    }
    
    // Create canvas for fire effect
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.className = 'absolute bottom-0 left-0 pointer-events-none';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Add canvas to DOM
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = '';
      canvasContainerRef.current.appendChild(canvas);
    }
    
    // Fire particles
    interface FireParticle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
      decay: number;
    }
    
    const particles: FireParticle[] = [];
    const maxParticles = 50 + Math.floor(intensity * 50); // Limit max particles
    
    // Create initial particles
    for (let i = 0; i < maxParticles / 2; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: dimensions.height,
        size: 30 + Math.random() * 40,
        speedY: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.3,
        decay: 0.01 + Math.random() * 0.01
      });
    }
    
    // Animation variables
    let lastUpdate = 0;
    const targetFPS = 24; // Lower FPS for fire animation
    const updateInterval = 1000 / targetFPS;
    
    // Animation function
    const animateFire = (timestamp: number) => {
      // Throttle updates
      if (timestamp - lastUpdate < updateInterval) {
        requestAnimationFrame(animateFire);
        return;
      }
      
      lastUpdate = timestamp;
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add new particles with lower frequency
      if (particles.length < maxParticles && Math.random() < 0.3) {
        particles.push({
          x: Math.random() * dimensions.width,
          y: dimensions.height,
          size: 30 + Math.random() * 40,
          speedY: 1 + Math.random() * 3,
          opacity: 0.3 + Math.random() * 0.3,
          decay: 0.01 + Math.random() * 0.01
        });
      }
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move upward
        p.y -= p.speedY;
        // Fade out
        p.opacity -= p.decay;
        // Shrink
        p.size *= 0.99;
        
        // Remove dead particles
        if (p.opacity <= 0 || p.size <= 5) {
          particles.splice(i, 1);
          i--;
          continue;
        }
        
        // Draw fire particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 80, 0, ${p.opacity})`);
        gradient.addColorStop(0.6, `rgba(255, 30, 0, ${p.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Continue animation loop if still in Blood Moon phase
      if (currentPhase === Phase.BloodMoon) {
        requestAnimationFrame(animateFire);
      }
    };
    
    // Start animation
    const animationId = requestAnimationFrame(animateFire);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
    };
  }, [currentPhase, dimensions, intensity]);
  
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