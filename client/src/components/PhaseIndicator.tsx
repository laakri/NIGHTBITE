import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Phase } from '../types/gameTypes';
import blood_energy_bg from "../assets/HUI/blood_energy_bg.png";

interface PhaseIndicatorProps {
  currentPhase: Phase;
  phaseEndsIn: number;
  phaseLocked?: boolean;
  phaseLockDuration?: number;
  phaseChangeCounter?: number;
  phaseJustChanged?: boolean;
  phaseOrder?: Phase[];
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPhase,
  phaseEndsIn,
  phaseLocked = false,
  phaseLockDuration = 0,
  phaseChangeCounter = 0,
  phaseJustChanged = false,
  phaseOrder = [Phase.Normal, Phase.BloodMoon, Phase.Void]
}) => {
  // Canvas ref for custom phase animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get colors for each phase
  const getPhaseColor = useCallback((phase: Phase): string => {
    switch (phase) {
      case Phase.BloodMoon:
        return '#ef4444'; // Red
      case Phase.Void:
        return '#a855f7'; // Purple
      case Phase.Normal:
      default:
        return '#22c55e'; // Green
    }
  }, []);
  
  // Get background gradient for current phase
  const getPhaseGradient = useCallback((phase: Phase): string => {
    switch (phase) {
      case Phase.BloodMoon:
        return 'linear-gradient(to right, rgba(30,0,0,0.9), rgba(80,0,0,0.8))';
      case Phase.Void:
        return 'linear-gradient(to right, rgba(30,0,40,0.9), rgba(60,0,80,0.8))';
      case Phase.Normal:
      default:
        return 'linear-gradient(to right, rgba(0,20,30,0.9), rgba(0,40,20,0.8))';
    }
  }, []);
  
  // Create animated particles effect on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    
    // Create particles
    const particleCount = 50;
    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      alpha: number;
    }[] = [];
    
    // Initialize particles based on current phase
    for (let i = 0; i < particleCount; i++) {
      const phaseColor = getPhaseColor(currentPhase);
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: phaseColor,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        alpha: 0.1 + Math.random() * 0.5
      });
    }
    
    // Animation function
    const animate = () => {
      // Clear canvas with semi-transparent black for trail effect
      context.fillStyle = 'rgba(0, 0, 0, 0.3)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Draw particle with glow effect
        context.beginPath();
        const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        context.fillStyle = gradient;
        context.globalAlpha = p.alpha;
        context.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        context.fill();
      }
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Clean up
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentPhase, phaseChangeCounter, getPhaseColor]);
  
  // Render phase dots with connections
  const renderPhaseDots = () => {
    return (
      <div className="flex items-center space-x-1 relative z-10">
        {phaseOrder.map((phase, index) => (
          <React.Fragment key={index}>
            {/* Phase dot with indicator */}
            <div 
              className={`relative transition-all duration-300 transform ${
                currentPhase === phase ? 'scale-125' : 'scale-100'
              }`}
            >
              <div 
                className={`w-4 h-4 rounded-full border-2 ${
                  currentPhase === phase 
                    ? `border-white bg-${getPhaseColor(phase).slice(1)} shadow-lg shadow-${getPhaseColor(phase).slice(1)}/50`
                    : 'border-gray-400 bg-gray-700'
                } transition-all duration-300`}
              />
              {currentPhase === phase && (
                <div 
                  className={`absolute inset-0 rounded-full animate-ping opacity-50 bg-${getPhaseColor(phase).slice(1)}`}
                />
              )}
            </div>
            
            {/* Connection line between dots */}
            {index < phaseOrder.length - 1 && (
              <div 
                className={`w-6 h-0.5 ${
                  currentPhase === phase || currentPhase === phaseOrder[index + 1]
                    ? 'bg-white/70'
                    : 'bg-gray-600'
                } transition-all duration-300`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Render phase name with appropriate styling
  const renderPhaseName = () => {
    let phaseIcon = '⚡';
    let phaseClass = 'text-green-400';
    
    switch (currentPhase) {
      case Phase.BloodMoon:
        phaseIcon = '🔴';
        phaseClass = 'text-red-400';
        break;
      case Phase.Void:
        phaseIcon = '🟣';
        phaseClass = 'text-purple-400';
        break;
    }
    
    return (
      <div className={`font-bold ${phaseClass} flex items-center space-x-1 transition-all duration-300`}>
        <span className="text-lg">{phaseIcon}</span>
        <span className="uppercase tracking-wider text-xs">{currentPhase}</span>
      </div>
    );
  };
  
  // Render phase timer with lock indicator if phase is locked
  const renderPhaseTimer = () => {
    return (
      <div className="flex items-center space-x-2">
        {phaseLocked && (
          <div className="text-amber-400 flex items-center space-x-1">
            <span className="text-sm">🔒</span>
            <span className="text-xs">{phaseLockDuration}</span>
          </div>
        )}
        <div className="relative flex items-center">
          <div className="w-14 h-14 flex items-center justify-center">
            <img src={blood_energy_bg} alt="timer" className="w-full h-full absolute inset-0 opacity-70" />
            <div className="relative z-10 flex flex-col items-center">
              <div className={`font-bold text-xl ${
                phaseEndsIn <= 2 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}>
                {phaseEndsIn}
              </div>
              <div className="text-gray-300 text-[10px] uppercase tracking-wider">turns</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Create flashing animation when phase just changed
  const phaseChangeAnimation = phaseJustChanged 
    ? 'animate-flash opacity-80' 
    : '';
  
  return (
    <div 
      className={`relative overflow-hidden rounded-lg border border-gray-700/50 shadow-lg ${phaseChangeAnimation}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative z-10 py-2 px-4 backdrop-blur-sm flex items-center justify-between transition-all duration-300"
        style={{
          background: getPhaseGradient(currentPhase)
        }}
      >
        {/* Left side - Phase name and dots */}
        <div className="flex flex-col space-y-2">
          {renderPhaseName()}
          {renderPhaseDots()}
        </div>
        
        {/* Right side - Phase timer */}
        {renderPhaseTimer()}
      </div>
      
      {/* Canvas background for animated particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />
      
      {/* Hover overlay with more details (optional) */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center transition-opacity duration-300">
          <div className="text-white text-xs text-center p-2">
            <p>Phase: <span className="font-bold">{currentPhase}</span></p>
            <p>Changes in: <span className="font-bold">{phaseEndsIn}</span> turns</p>
            {phaseLocked && (
              <p className="text-amber-400">
                Phase Locked: <span className="font-bold">{phaseLockDuration}</span> turns
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseIndicator; 