import { useEffect, useState } from 'react';
import { EffectType } from '../types/gameTypes';
import { useGame } from '../contexts/GameContext';

const EffectBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState('translate-x-[100vw]');
  const [lastEffectId, setLastEffectId] = useState<number | null>(null);
  const { gameState } = useGame();

  useEffect(() => {
    // Check if there's a new effect to display
    if (gameState?.lastAppliedEffect && 
        gameState.lastAppliedEffect.appliedAt !== lastEffectId) {
      
      // Store the current effect ID to avoid showing it again
      setLastEffectId(gameState.lastAppliedEffect.appliedAt);
      
      // Show the banner
      setVisible(true);
      
      // Animation sequence
      setTimeout(() => setPosition('translate-x-0'), 100);
      
      // Pause in center then exit
      setTimeout(() => {
        setPosition('translate-x-[-100vw]');
        setTimeout(() => setVisible(false), 500);
      }, 1500);
    }
  }, [gameState?.lastAppliedEffect, lastEffectId]);

  // If no effect or not visible, don't render anything
  if (!visible || !gameState?.lastAppliedEffect) return null;

  const effect = gameState.lastAppliedEffect;
  
  // Get effect-specific styling
  const { backgroundColor, textColor, icon, message } = getEffectStyling(effect);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      {/* Banner */}
      <div 
        className={`relative px-8 py-4 rounded-lg shadow-lg transform transition-transform duration-500 ease-out ${position}`}
        style={{ backgroundColor }}
      >
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{icon}</div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: textColor }}>
              {effect.sourceCardName}
            </h3>
            <p className="text-white text-lg">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get styling based on effect type
function getEffectStyling(effect: any): { 
  backgroundColor: string; 
  textColor: string; 
  icon: string; 
  message: string;
} {
  // Default styling
  let styling = {
    backgroundColor: '#333',
    textColor: 'white',
    icon: '✨',
    message: 'Effect activated!'
  };

  // Customize based on effect type
  switch (effect.type) {
    case EffectType.SWITCH_PHASE:
      styling = {
        backgroundColor: 'rgba(75, 0, 130, 0.8)',
        textColor: '#FFD700',
        icon: '🔄',
        message: 'Phase has changed!'
      };
      break;
      
    case EffectType.SELF_DAMAGE:
      styling = {
        backgroundColor: 'rgba(180, 0, 0, 0.8)',
        textColor: '#FF6347',
        icon: '💥',
        message: `Deals ${effect.value || 0} damage!`
      };
      break;
      
    case EffectType.DISCARD:
      styling = {
        backgroundColor: 'rgba(50, 50, 50, 0.8)',
        textColor: '#E0E0E0',
        icon: '🗑️',
        message: `Opponent discards ${effect.value || 1} card(s)!`
      };
      break;
      
    case EffectType.DRAW:
      styling = {
        backgroundColor: 'rgba(0, 100, 150, 0.8)',
        textColor: '#87CEEB',
        icon: '🃏',
        message: `Draw ${effect.value || 1} card(s)!`
      };
      break;
      
    case EffectType.ADD_SHIELD:
      styling = {
        backgroundColor: 'rgba(0, 50, 120, 0.8)',
        textColor: '#4169E1',
        icon: '🛡️',
        message: `Gain ${effect.value || 2} shield!`
      };
      break;
      
    case EffectType.REDUCE_COST:
      styling = {
        backgroundColor: 'rgba(70, 0, 100, 0.8)',
        textColor: '#9370DB',
        icon: '⚔️',
        message: `Reduce cost by ${effect.value || 1}!`
      };
      break;
      
    case EffectType.ADD_BURN:
      styling = {
        backgroundColor: 'rgba(200, 80, 0, 0.8)',
        textColor: '#FFA500',
        icon: '🔥',
        message: `Opponent burns for ${effect.value || 1} damage per turn!`
      };
      break;
      
    case EffectType.STEAL_CARD:
      styling = {
        backgroundColor: 'rgba(50, 0, 80, 0.8)',
        textColor: '#DA70D6',
        icon: '👋',
        message: 'Steal a card from opponent!'
      };
      break;
      
    case EffectType.LOCK_PHASE:
      styling = {
        backgroundColor: 'rgba(0, 100, 0, 0.8)',
        textColor: '#90EE90',
        icon: '🔒',
        message: `Phase locked for ${effect.value || 2} turns!`
      };
      break;
      
    case EffectType.COPY_EFFECT:
      styling = {
        backgroundColor: 'rgba(100, 50, 150, 0.8)',
        textColor: '#DDA0DD',
        icon: '📋',
        message: 'Copying last card effect!'
      };
      break;
      
    case EffectType.DELAY:
      styling = {
        backgroundColor: 'rgba(80, 80, 80, 0.8)',
        textColor: '#D3D3D3',
        icon: '⏳',
        message: `Effect delayed for ${effect.value || 2} turns!`
      };
      break;
      
    case EffectType.REVERSE:
      styling = {
        backgroundColor: 'rgba(150, 0, 150, 0.8)',
        textColor: '#FF69B4',
        icon: '↩️',
        message: 'Effect reversed!'
      };
      break;
      
    case EffectType.TRAP:
      styling = {
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        textColor: '#F4A460',
        icon: '⚠️',
        message: 'Trap activated!'
      };
      break;
      
    default:
      // Use default styling for other effects
      break;
  }

  return styling;
}

export default EffectBanner; 