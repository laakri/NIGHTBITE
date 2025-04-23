import React, { useEffect, useState } from 'react';
import { Phase } from '../../types/gameTypes';
import './cardAnnouncementAnimations.css';

// Define props for the CardGameAnnouncement component
export interface CardGameAnnouncementProps {
  message: string;
  subMessage?: string;
  phase: Phase;
  duration?: number;
  show: boolean;
  type?: 'standard' | 'critical' | 'victory' | 'defeat';
  onComplete?: () => void;
}

// Animation states
type AnimationState = 'hidden' | 'enter' | 'hold' | 'exit';

// Component for displaying dramatic card game announcements
export const CardGameAnnouncement: React.FC<CardGameAnnouncementProps> = ({
  message,
  subMessage = '',
  phase = Phase.Normal,
  duration = 2000,
  show,
  type = 'standard',
  onComplete
}) => {
  // Animation state management
  const [animationState, setAnimationState] = useState<AnimationState>('hidden');
  
  // Control animation sequence based on show prop
  useEffect(() => {
    let enterTimer: NodeJS.Timeout;
    let holdTimer: NodeJS.Timeout;
    let exitTimer: NodeJS.Timeout;
    
    if (show) {
      // Start the animation sequence
      setAnimationState('enter');
      
      // After enter animation completes, switch to hold state
      enterTimer = setTimeout(() => {
        setAnimationState('hold');
        
        // Hold the announcement for the specified duration
        holdTimer = setTimeout(() => {
          setAnimationState('exit');
          
          // After exit animation completes, hide the announcement
          exitTimer = setTimeout(() => {
            setAnimationState('hidden');
            if (onComplete) onComplete();
          }, 500); // 500ms for exit animation
        }, duration);
      }, 500); // 500ms for enter animation
    } else {
      // Force hide if show is explicitly set to false
      setAnimationState('hidden');
    }
    
    // Clean up timers on component unmount or when show changes
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [show, duration, onComplete]);
  
  // Generate appropriate classes based on phase and type
  const getAnnouncementClasses = () => {
    const baseClass = 'card-game-announcement';
    const stateClass = `announcement-${animationState}`;
    const phaseClass = `phase-${phase.toLowerCase()}`;
    const typeClass = `type-${type}`;
    
    return `${baseClass} ${stateClass} ${phaseClass} ${typeClass}`;
  };
  
  // Get theme-specific colors based on phase
  const getPhaseColors = () => {
    switch (phase) {
      case Phase.BloodMoon:
        return {
          primaryColor: '#ff0000',
          secondaryColor: '#800000',
          textShadow: '0 0 10px #ff3333, 0 0 20px #ff0000'
        };
      case Phase.Void:
        return {
          primaryColor: '#9400d3',
          secondaryColor: '#3a015c',
          textShadow: '0 0 10px #b866ff, 0 0 20px #9400d3'
        };
      default:
        return {
          primaryColor: '#ffffff',
          secondaryColor: '#cccccc',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
        };
    }
  };
  
  // Get type-specific classes
  const getTypeClass = () => {
    switch (type) {
      case 'critical':
        return 'critical-announcement';
      case 'victory':
        return 'victory-announcement';
      case 'defeat':
        return 'defeat-announcement';
      default:
        return '';
    }
  };
  
  // Only render if there's a message or the component is visible
  if (!message || animationState === 'hidden') {
    return null;
  }
  
  const phaseColors = getPhaseColors();
  
  return (
    <div className={getAnnouncementClasses()}>
      <div 
        className={`announcement-content ${getTypeClass()}`}
        style={{
          color: phaseColors.primaryColor,
          textShadow: phaseColors.textShadow
        }}
      >
        <div className="announcement-message">{message}</div>
        {subMessage && (
          <div className="announcement-submessage">{subMessage}</div>
        )}
      </div>
    </div>
  );
};

export default CardGameAnnouncement; 