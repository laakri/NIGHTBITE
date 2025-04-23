import React, { useEffect, useState } from 'react';
import { Phase } from '../../types/gameTypes';
import './announcementAnimations.css';

interface GameAnnouncementProps {
  message: string;
  phase?: Phase;
  duration?: number;
  show: boolean;
  onComplete?: () => void;
}

/**
 * A simple, clean announcement that slides into view and fades out
 */
const GameAnnouncement: React.FC<GameAnnouncementProps> = ({
  message,
  phase = Phase.Normal,
  duration = 2000,
  show,
  onComplete
}) => {
  const [animationState, setAnimationState] = useState<'enter' | 'hold' | 'exit' | 'hidden'>('hidden');
  
  useEffect(() => {
    if (show) {
      // Start animation sequence
      setAnimationState('enter');
      
      // Hold the announcement
      const holdTimer = setTimeout(() => {
        setAnimationState('hold');
      }, 800);
      
      // Exit after duration
      const exitTimer = setTimeout(() => {
        setAnimationState('exit');
      }, duration - 800);
      
      // Complete the animation
      const completeTimer = setTimeout(() => {
        setAnimationState('hidden');
        if (onComplete) onComplete();
      }, duration);
      
      return () => {
        clearTimeout(holdTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setAnimationState('hidden');
    }
  }, [show, duration, onComplete]);
  
  // Don't render anything when hidden
  if (animationState === 'hidden') return null;
  
  // Get phase-specific colors
  const getPhaseColors = () => {
    switch (phase) {
      case Phase.BloodMoon:
        return '#ef4444';
      case Phase.Void:
        return '#a855f7';
      case Phase.Normal:
      default:
        return '#ffffff';
    }
  };
  
  const textColor = getPhaseColors();
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className={`
          transform px-6 py-3 text-center
          ${animationState === 'enter' ? 'animate-anime-slide-in' : ''}
          ${animationState === 'exit' ? 'animate-anime-fade-out' : ''}
          ${animationState === 'hold' ? 'opacity-100' : ''}
        `}
      >
        <h1 
          className="text-7xl md:text-9xl font-bold text-center uppercase tracking-wider"
          style={{ color: textColor }}
        >
          {message.split('').map((char, index) => (
            <span 
              key={index} 
              className="inline-block"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'forwards',
                opacity: animationState === 'enter' ? 0 : 1,
                animation: animationState === 'enter' ? `character-reveal 0.3s ${index * 0.05}s forwards` : ''
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
};

export default GameAnnouncement; 