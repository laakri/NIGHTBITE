import { useEffect, useState } from 'react';
import { EffectType } from '../types/gameTypes';
import { useGame } from '../contexts/GameContext';

const EffectBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState('translate-x-[100vw]');
  const [scale, setScale] = useState('scale-90');
  const [opacity, setOpacity] = useState('opacity-0');
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
      // 1. Fade in and slide from right
      setTimeout(() => {
        setPosition('translate-x-0');
        setScale('scale-100');
        setOpacity('opacity-100');
      }, 100);
      
      // 2. Hold in center
      setTimeout(() => {
        // 3. Scale up slightly for emphasis
        setScale('scale-105');
        setTimeout(() => setScale('scale-100'), 200);
      }, 800);
      
      // 4. Exit to left with fade
      setTimeout(() => {
        setPosition('translate-x-[-100vw]');
        setOpacity('opacity-0');
        setTimeout(() => setVisible(false), 600);
      }, 2000);
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
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${opacity}`}></div>
      
      {/* Banner */}
      <div 
        className={`relative w-full max-w-4xl mx-auto px-10 py-8 transform transition-all duration-500 ease-out ${position} ${scale} ${opacity}`}
        style={{ backgroundColor }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30"></div>
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-24 bg-white/20 rounded-l-full"></div>
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-24 bg-white/20 rounded-r-full"></div>
        
        {/* Content */}
        <div className="flex items-center justify-center space-x-8">
          {/* Icon */}
          <div className="text-7xl animate-pulse">{icon}</div>
          
          {/* Text */}
          <div className="flex-1">
            <h3 
              className="text-4xl font-bold mb-2 tracking-wider" 
              style={{ color: textColor, textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
            >
              {effect.sourceCardName}
            </h3>
            <p className="text-white text-2xl font-medium">
              {message}
            </p>
          </div>
        </div>
        
        {/* Particle effects */}
        <div className="absolute inset-0 overflow-hidden">
          {Array(10).fill(0).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `float ${Math.random() * 3 + 2}s infinite ease-in-out`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Additional visual impact element */}
      <div 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200vw] h-20 bg-white/10 rotate-[30deg] transition-opacity duration-500 ${opacity}`}
        style={{ 
          boxShadow: '0 0 40px 20px rgba(255,255,255,0.1)'
        }}
      ></div>
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
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    textColor: 'white',
    icon: '✨',
    message: 'Effect activated!'
  };

  // Customize based on effect type
  switch (effect.type) {
    case EffectType.SWITCH_PHASE:
      styling = {
        backgroundColor: 'rgba(75, 0, 130, 0.9)',
        textColor: '#FFD700',
        icon: '🔄',
        message: 'Phase has changed!'
      };
      break;
      
    case EffectType.SELF_DAMAGE:
      styling = {
        backgroundColor: 'rgba(180, 0, 0, 0.9)',
        textColor: '#FF6347',
        icon: '💥',
        message: `Deals ${effect.value || 0} damage!`
      };
      break;
      
    case EffectType.DISCARD:
      styling = {
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        textColor: '#E0E0E0',
        icon: '🗑️',
        message: `Opponent discards ${effect.value || 1} card(s)!`
      };
      break;
      
    case EffectType.DRAW:
      styling = {
        backgroundColor: 'rgba(0, 100, 150, 0.9)',
        textColor: '#87CEEB',
        icon: '🃏',
        message: `Draw ${effect.value || 1} card(s)!`
      };
      break;
      
    case EffectType.ADD_SHIELD:
      styling = {
        backgroundColor: 'rgba(0, 50, 120, 0.9)',
        textColor: '#4169E1',
        icon: '🛡️',
        message: `Gain ${effect.value || 2} shield!`
      };
      break;
      
    case EffectType.REDUCE_COST:
      styling = {
        backgroundColor: 'rgba(70, 0, 100, 0.9)',
        textColor: '#9370DB',
        icon: '⚔️',
        message: `Reduce cost by ${effect.value || 1}!`
      };
      break;
      
    case EffectType.ADD_BURN:
      styling = {
        backgroundColor: 'rgba(200, 80, 0, 0.9)',
        textColor: '#FFA500',
        icon: '🔥',
        message: `Opponent burns for ${effect.value || 1} damage per turn!`
      };
      break;
      
    case EffectType.STEAL_CARD:
      styling = {
        backgroundColor: 'rgba(50, 0, 80, 0.9)',
        textColor: '#DA70D6',
        icon: '👋',
        message: 'Steal a card from opponent!'
      };
      break;
      
    case EffectType.LOCK_PHASE:
      styling = {
        backgroundColor: 'rgba(0, 100, 0, 0.9)',
        textColor: '#90EE90',
        icon: '🔒',
        message: `Phase locked for ${effect.value || 2} turns!`
      };
      break;
      
    case EffectType.COPY_EFFECT:
      styling = {
        backgroundColor: 'rgba(100, 50, 150, 0.9)',
        textColor: '#DDA0DD',
        icon: '📋',
        message: 'Copying last card effect!'
      };
      break;
      
    case EffectType.DELAY:
      styling = {
        backgroundColor: 'rgba(80, 80, 80, 0.9)',
        textColor: '#D3D3D3',
        icon: '⏳',
        message: `Effect delayed for ${effect.value || 2} turns!`
      };
      break;
      
    case EffectType.REVERSE:
      styling = {
        backgroundColor: 'rgba(150, 0, 150, 0.9)',
        textColor: '#FF69B4',
        icon: '↩️',
        message: 'Effect reversed!'
      };
      break;
      
    case EffectType.TRAP:
      styling = {
        backgroundColor: 'rgba(139, 69, 19, 0.9)',
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

// Add this to your global CSS or in a style tag
const floatKeyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
`;

export default EffectBanner; 