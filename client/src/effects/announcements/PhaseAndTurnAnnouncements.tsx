import React, { useEffect, useState } from 'react';
import { Phase } from '../../types/gameTypes';
import { CardGameAnnouncement } from './CardGameAnnouncement';

// Phase announcement configurations
const PHASE_ANNOUNCEMENTS = {
  [Phase.Normal]: {
    message: 'NORMAL PHASE',
    subMessage: 'Balance restored',
    type: 'standard' as const
  },
  [Phase.BloodMoon]: {
    message: 'BLOOD MOON',
    subMessage: 'Darkness rises',
    type: 'critical' as const
  },
  [Phase.Void]: {
    message: 'VOID AWAKENS',
    subMessage: 'Beware the shadows',
    type: 'defeat' as const
  }
};

// Turn announcement configurations
const TURN_ANNOUNCEMENTS = {
  start: {
    message: 'YOUR TURN',
    subMessage: 'Make your move',
    type: 'standard' as const
  },
  end: {
    message: 'TURN ENDED',
    subMessage: 'Waiting for opponent',
    type: 'standard' as const
  },
  opponent: {
    message: 'OPPONENT\'S TURN',
    subMessage: 'Waiting for opponent',
    type: 'standard' as const
  }
};

interface PhaseAndTurnAnnouncementsProps {
  currentPhase: Phase;
  isPlayerTurn: boolean;
  onPhaseChange?: () => void;
  onTurnChange?: () => void;
}

// Component for displaying phase and turn announcements
export const PhaseAndTurnAnnouncements: React.FC<PhaseAndTurnAnnouncementsProps> = ({
  currentPhase,
  isPlayerTurn,
  onPhaseChange,
  onTurnChange
}) => {
  // Track previous phase and turn to detect changes
  const [prevPhase, setPrevPhase] = useState<Phase | null>(null);
  const [prevIsPlayerTurn, setPrevIsPlayerTurn] = useState<boolean | null>(null);
  
  // State for controlling announcements
  const [showPhaseAnnouncement, setShowPhaseAnnouncement] = useState(false);
  const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
  
  // Detect phase changes
  useEffect(() => {
    // Skip the initial render
    if (prevPhase === null) {
      setPrevPhase(currentPhase);
      return;
    }
    
    // If phase changed, show announcement
    if (prevPhase !== currentPhase) {
      setShowPhaseAnnouncement(true);
      setPrevPhase(currentPhase);
      
      // Call the callback if provided
      if (onPhaseChange) {
        onPhaseChange();
      }
    }
  }, [currentPhase, prevPhase, onPhaseChange]);
  
  // Detect turn changes
  useEffect(() => {
    // Skip the initial render
    if (prevIsPlayerTurn === null) {
      setPrevIsPlayerTurn(isPlayerTurn);
      return;
    }
    
    // If turn changed, show announcement
    if (prevIsPlayerTurn !== isPlayerTurn) {
      setShowTurnAnnouncement(true);
      setPrevIsPlayerTurn(isPlayerTurn);
      
      // Call the callback if provided
      if (onTurnChange) {
        onTurnChange();
      }
    }
  }, [isPlayerTurn, prevIsPlayerTurn, onTurnChange]);
  
  // Handle announcement completion
  const handlePhaseAnnouncementComplete = () => {
    setShowPhaseAnnouncement(false);
  };
  
  const handleTurnAnnouncementComplete = () => {
    setShowTurnAnnouncement(false);
  };
  
  // Determine which turn announcement to show
  const getTurnAnnouncement = () => {
    if (isPlayerTurn) {
      return TURN_ANNOUNCEMENTS.start;
    } else {
      return TURN_ANNOUNCEMENTS.opponent;
    }
  };
  
  return (
    <>
      {/* Phase announcement */}
      <CardGameAnnouncement
        show={showPhaseAnnouncement}
        message={PHASE_ANNOUNCEMENTS[currentPhase].message}
        subMessage={PHASE_ANNOUNCEMENTS[currentPhase].subMessage}
        phase={currentPhase}
        duration={2500}
        type={PHASE_ANNOUNCEMENTS[currentPhase].type}
        onComplete={handlePhaseAnnouncementComplete}
      />
      
      {/* Turn announcement */}
      <CardGameAnnouncement
        show={showTurnAnnouncement}
        message={getTurnAnnouncement().message}
        subMessage={getTurnAnnouncement().subMessage}
        phase={currentPhase}
        duration={2000}
        type={getTurnAnnouncement().type}
        onComplete={handleTurnAnnouncementComplete}
      />
    </>
  );
};

export default PhaseAndTurnAnnouncements; 