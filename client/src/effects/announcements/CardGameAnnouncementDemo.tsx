import React, { useState } from 'react';
import { CardGameAnnouncement } from './CardGameAnnouncement';
import { Phase } from '../../types/gameTypes';
import './cardAnnouncementAnimations.css';

// Announcement types
type AnnouncementType = 'standard' | 'critical' | 'victory' | 'defeat';

interface PresetAnnouncement {
  message: string;
  subMessage?: string;
  phase: Phase;
  type: AnnouncementType;
}

export const CardGameAnnouncementDemo: React.FC = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [message, setMessage] = useState('YOUR TURN');
  const [subMessage, setSubMessage] = useState('Make your move');
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.Normal);
  const [duration, setDuration] = useState(3000);
  const [selectedType, setSelectedType] = useState<AnnouncementType>('standard');

  const presetAnnouncements: PresetAnnouncement[] = [
    { message: 'DRAW 2', subMessage: 'Extra cards drawn', phase: Phase.Normal, type: 'standard' },
    { message: 'YOUR TURN', subMessage: 'Make your move', phase: Phase.Normal, type: 'standard' },
    { message: 'CRITICAL HIT', subMessage: 'Double damage!', phase: Phase.BloodMoon, type: 'critical' },
    { message: 'BLOOD MOON', subMessage: 'Darkness rises', phase: Phase.BloodMoon, type: 'standard' },
    { message: 'VOID AWAKENS', subMessage: 'Beware the shadows', phase: Phase.Void, type: 'standard' },
    { message: 'VICTORY', subMessage: 'You win the match!', phase: Phase.Normal, type: 'victory' },
    { message: 'DEFEAT', subMessage: 'Better luck next time', phase: Phase.Normal, type: 'defeat' },
    { message: 'COMBO', subMessage: '+3 card chain', phase: Phase.BloodMoon, type: 'critical' },
    { message: 'TIME OUT', subMessage: 'Turn skipped', phase: Phase.Void, type: 'defeat' },
  ];

  const handleTriggerAnnouncement = (preset?: PresetAnnouncement) => {
    if (preset) {
      setMessage(preset.message);
      setSubMessage(preset.subMessage || '');
      setCurrentPhase(preset.phase);
      setSelectedType(preset.type);
    }
    setShowAnnouncement(true);
  };

  const handleAnnouncementComplete = () => {
    setShowAnnouncement(false);
  };

  const getButtonStyle = (phase: Phase) => {
    const baseStyle = {
      padding: '8px 12px',
      margin: '5px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold' as const,
      transition: 'all 0.3s ease',
    };

    switch (phase) {
      case Phase.BloodMoon:
        return {
          ...baseStyle,
          backgroundColor: '#8b0000',
          color: 'white',
          boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
        };
      case Phase.Void:
        return {
          ...baseStyle,
          backgroundColor: '#2c2c54',
          color: '#b8b8ff',
          boxShadow: '0 0 10px rgba(72, 61, 139, 0.5)',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#4a90e2',
          color: 'white',
          boxShadow: '0 0 10px rgba(74, 144, 226, 0.5)',
        };
    }
  };

  const getTypeButtonStyle = (type: AnnouncementType) => {
    const baseStyle = {
      padding: '8px 12px',
      margin: '5px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold' as const,
      transition: 'all 0.3s ease',
    };

    switch (type) {
      case 'critical':
        return {
          ...baseStyle,
          backgroundColor: '#ff9800',
          color: 'white',
        };
      case 'victory':
        return {
          ...baseStyle,
          backgroundColor: '#4caf50',
          color: 'white',
        };
      case 'defeat':
        return {
          ...baseStyle,
          backgroundColor: '#f44336',
          color: 'white',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#2196f3',
          color: 'white',
        };
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Card Game Announcements</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Preset Announcements</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {presetAnnouncements.map((preset, index) => (
            <button 
              key={index}
              onClick={() => handleTriggerAnnouncement(preset)}
              style={getButtonStyle(preset.phase)}
            >
              {preset.message}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Custom Announcement</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Message:</label>
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Sub-message:</label>
          <input 
            type="text" 
            value={subMessage} 
            onChange={(e) => setSubMessage(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Phase:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setCurrentPhase(Phase.Normal)} 
              style={{
                ...getButtonStyle(Phase.Normal),
                opacity: currentPhase === Phase.Normal ? 1 : 0.6,
              }}
            >
              Normal
            </button>
            <button 
              onClick={() => setCurrentPhase(Phase.BloodMoon)} 
              style={{
                ...getButtonStyle(Phase.BloodMoon),
                opacity: currentPhase === Phase.BloodMoon ? 1 : 0.6,
              }}
            >
              Blood Moon
            </button>
            <button 
              onClick={() => setCurrentPhase(Phase.Void)} 
              style={{
                ...getButtonStyle(Phase.Void),
                opacity: currentPhase === Phase.Void ? 1 : 0.6,
              }}
            >
              Void
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Type:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setSelectedType('standard')} 
              style={{
                ...getTypeButtonStyle('standard'),
                opacity: selectedType === 'standard' ? 1 : 0.6,
              }}
            >
              Standard
            </button>
            <button 
              onClick={() => setSelectedType('critical')} 
              style={{
                ...getTypeButtonStyle('critical'),
                opacity: selectedType === 'critical' ? 1 : 0.6,
              }}
            >
              Critical
            </button>
            <button 
              onClick={() => setSelectedType('victory')} 
              style={{
                ...getTypeButtonStyle('victory'),
                opacity: selectedType === 'victory' ? 1 : 0.6,
              }}
            >
              Victory
            </button>
            <button 
              onClick={() => setSelectedType('defeat')} 
              style={{
                ...getTypeButtonStyle('defeat'),
                opacity: selectedType === 'defeat' ? 1 : 0.6,
              }}
            >
              Defeat
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Duration: {duration}ms
          </label>
          <input 
            type="range" 
            min="1000" 
            max="5000" 
            step="500" 
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button 
          onClick={() => handleTriggerAnnouncement()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%',
          }}
        >
          Show Announcement
        </button>
      </div>

      <CardGameAnnouncement
        show={showAnnouncement}
        message={message}
        subMessage={subMessage}
        phase={currentPhase}
        duration={duration}
        type={selectedType}
        onComplete={handleAnnouncementComplete}
      />
    </div>
  );
};

export default CardGameAnnouncementDemo; 