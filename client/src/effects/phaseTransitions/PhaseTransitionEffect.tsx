import React, { useEffect, useRef, useState } from 'react';
import { Phase } from '../../types/gameTypes';
import ThemeTransitionManager from './ThemeTransitionManager';

interface PhaseTransitionEffectProps {
  phase: Phase;
  phaseJustChanged: boolean;
}

/**
 * Component that renders visual effects during phase transitions
 */
const PhaseTransitionEffect: React.FC<PhaseTransitionEffectProps> = ({
  phase,
  phaseJustChanged
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fromPhase, setFromPhase] = useState<Phase | null>(null);
  const [toPhase, setToPhase] = useState<Phase>(phase);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Initialize transition manager
  const transitionManager = ThemeTransitionManager.getInstance();
  
  // Listen for phase changes
  useEffect(() => {
    // Skip initial render
    if (fromPhase === null) {
      setFromPhase(phase);
      return;
    }
    
    // If phase has changed, trigger transition
    if (phase !== fromPhase && phaseJustChanged) {
      setIsTransitioning(true);
      setFromPhase(fromPhase);
      setToPhase(phase);
      
      // End transition after duration
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, transitionManager.getCurrentTheme().glowIntensity * 1500);
      
      return () => clearTimeout(timer);
    }
  }, [phase, phaseJustChanged, fromPhase]);
  
  // Handle canvas animation for transition effects
  useEffect(() => {
    if (!isTransitioning || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get themes for the transition
    const fromTheme = transitionManager.getPhaseTheme(fromPhase || Phase.Normal);
    const toTheme = transitionManager.getPhaseTheme(toPhase);
    
    // Create particles for the animation
    const particleCount = 200;
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      fadeSpeed: number;
    }[] = [];
    
    // Initialize particles based on the new phase
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 2,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
        color: toTheme.particleColor,
        opacity: Math.random() * 0.5 + 0.3,
        fadeSpeed: Math.random() * 0.02 + 0.005
      });
    }
    
    // Flash animation variables
    let flashOpacity = 1;
    const startTime = Date.now();
    const duration = 1500;
    
    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate transition progress
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      
      // Draw flash effect
      if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashOpacity -= 0.05;
      }
      
      // Draw particles
      particles.forEach((particle, index) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        
        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Fade particles
        particle.opacity -= particle.fadeSpeed;
        
        // Remove faded particles
        if (particle.opacity <= 0) {
          particles.splice(index, 1);
        }
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
      });
      
      // Add new particles as old ones fade
      while (particles.length < particleCount * (1 - progress)) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 5 + 2,
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3,
          color: toTheme.particleColor,
          opacity: Math.random() * 0.5 + 0.3,
          fadeSpeed: Math.random() * 0.02 + 0.005
        });
      }
      
      // Create a radial gradient based on the new phase
      if (progress < 0.8) {
        const radius = Math.min(canvas.width, canvas.height) * progress;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          radius
        );
        
        gradient.addColorStop(0, `${toTheme.primaryColor}33`); // 20% opacity
        gradient.addColorStop(0.7, `${toTheme.primaryColor}11`); // 7% opacity
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Continue animation if still transitioning
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animate();
    
    // Clean up
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTransitioning, fromPhase, toPhase]);
  
  // Special blood moon effect
  const renderBloodMoonEffect = () => {
    if (toPhase !== Phase.BloodMoon || !isTransitioning) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
        <div className="w-full h-full bg-red-900/20 animate-pulse"></div>
        {/* Radial blood effect */}
        <div className="absolute inset-0 bg-gradient-radial from-red-900/40 via-red-900/5 to-transparent animate-expand"></div>
        {/* Blood veins growing from center */}
        <div className="absolute w-1/2 h-1/2 max-w-lg max-h-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-red-700/40 animate-grow-vein" 
              style={{
                width: '2px',
                height: '0',
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 72}deg)`,
                transformOrigin: 'bottom',
                animationDelay: `${i * 100}ms`
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  };
  
  // Special void effect
  const renderVoidEffect = () => {
    if (toPhase !== Phase.Void || !isTransitioning) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none z-50">
        {/* Void distortion effect */}
        <div className="w-full h-full bg-purple-900/20 backdrop-blur-sm animate-pulse"></div>
        
        {/* Void center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 rounded-full bg-gradient-radial from-purple-700 via-purple-900/50 to-transparent animate-void-pulse"></div>
        </div>
        
        {/* Lightning effects */}
        {Array.from({ length: 3 }).map((_, i) => {
          const rotation = Math.random() * 360;
          const delay = Math.random() * 0.5;
          
          return (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 h-px bg-purple-300/70"
              style={{
                width: `${30 + Math.random() * 30}%`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'left center',
                animation: `lightning 0.5s ${delay}s ease-out`,
                opacity: 0
              }}
            ></div>
          );
        })}
      </div>
    );
  };
  
  // Only render when a transition is happening
  if (!isTransitioning) return null;
  
  return (
    <>
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
      />
      {toPhase === Phase.BloodMoon && renderBloodMoonEffect()}
      {toPhase === Phase.Void && renderVoidEffect()}
    </>
  );
};

export default PhaseTransitionEffect; 