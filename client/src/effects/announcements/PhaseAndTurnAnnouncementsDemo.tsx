import React, { useState } from 'react';
import { Phase } from '../../types/gameTypes';
import PhaseAndTurnAnnouncements from './PhaseAndTurnAnnouncements';

export const PhaseAndTurnAnnouncementsDemo: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.Normal);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  
  // Simulate phase changes
  const handlePhaseChange = (phase: Phase) => {
    setCurrentPhase(phase);
  };
  
  // Simulate turn changes
  const togglePlayerTurn = () => {
    setIsPlayerTurn(!isPlayerTurn);
  };
  
  // Get button styles based on phase
  const getPhaseButtonStyle = (phase: Phase) => {
    const baseStyle = {
      padding: '10px 15px',
      margin: '5px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold' as const,
      transition: 'all 0.3s ease',
    };
    
    const activeStyle = {
      transform: 'scale(1.05)',
      boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
    };
    
    let style;
    
    switch (phase) {
      case Phase.BloodMoon:
        style = {
          ...baseStyle,
          backgroundColor: '#8b0000',
          color: 'white',
          boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
        };
        break;
      case Phase.Void:
        style = {
          ...baseStyle,
          backgroundColor: '#2c2c54',
          color: '#b8b8ff',
          boxShadow: '0 0 10px rgba(72, 61, 139, 0.5)',
        };
        break;
      default:
        style = {
          ...baseStyle,
          backgroundColor: '#4a90e2',
          color: 'white',
          boxShadow: '0 0 10px rgba(74, 144, 226, 0.5)',
        };
    }
    
    // Apply active styles if this is the current phase
    if (phase === currentPhase) {
      return { ...style, ...activeStyle };
    }
    
    return style;
  };
  
  // Get turn button style
  const getTurnButtonStyle = () => {
    const baseStyle = {
      padding: '10px 15px',
      margin: '5px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold' as const,
      transition: 'all 0.3s ease',
      backgroundColor: isPlayerTurn ? '#4caf50' : '#f44336',
      color: 'white',
    };
    
    return baseStyle;
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Phase & Turn Announcements</h2>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
      }}>
        <h3 style={{ margin: 0 }}>
          Current Phase: <span style={{ color: getPhaseColor(currentPhase) }}>{getPhaseText(currentPhase)}</span> | 
          Turn Status: <span style={{ color: isPlayerTurn ? '#4caf50' : '#f44336' }}>
            {isPlayerTurn ? 'Your Turn' : 'Opponent\'s Turn'}
          </span>
        </h3>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Change Phase:</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={() => handlePhaseChange(Phase.Normal)}
            style={getPhaseButtonStyle(Phase.Normal)}
          >
            Normal Phase
          </button>
          <button 
            onClick={() => handlePhaseChange(Phase.BloodMoon)}
            style={getPhaseButtonStyle(Phase.BloodMoon)}
          >
            Blood Moon Phase
          </button>
          <button 
            onClick={() => handlePhaseChange(Phase.Void)}
            style={getPhaseButtonStyle(Phase.Void)}
          >
            Void Phase
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Change Turn:</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={togglePlayerTurn}
            style={getTurnButtonStyle()}
          >
            {isPlayerTurn ? 'End Your Turn' : 'Start Your Turn'}
          </button>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '30px', 
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <h3>Effect Preview:</h3>
        <p>The announcements will appear when phase or turn changes. Try clicking the buttons above.</p>
        <p>Each phase has a unique style and animations:</p>
        <ul>
          <li><strong>Normal:</strong> Clean, standard appearance</li>
          <li><strong>Blood Moon:</strong> Red, pulsing effects, more dramatic</li>
          <li><strong>Void:</strong> Purple, mysterious, with void-like animations</li>
        </ul>
      </div>
      
      {/* The actual announcement component */}
      <PhaseAndTurnAnnouncements 
        currentPhase={currentPhase}
        isPlayerTurn={isPlayerTurn}
      />
    </div>
  );
};

// Helper functions
function getPhaseText(phase: Phase): string {
  switch (phase) {
    case Phase.BloodMoon: return 'Blood Moon';
    case Phase.Void: return 'Void';
    default: return 'Normal';
  }
}

function getPhaseColor(phase: Phase): string {
  switch (phase) {
    case Phase.BloodMoon: return '#ff0000';
    case Phase.Void: return '#9400d3';
    default: return '#4a90e2';
  }
}

export default PhaseAndTurnAnnouncementsDemo; 