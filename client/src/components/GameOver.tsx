import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

const GameOver: React.FC = () => {
  const { gameState } = useGame();
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState('opacity-0');
  const [scale, setScale] = useState('scale-95');
  
  // Animation timing
  useEffect(() => {
    console.log('GameOver component mounted');
    console.log('gameState?.isGameOver:', gameState?.isGameOver);
    
    if (gameState?.isGameOver) {
      setVisible(true);
      setTimeout(() => {
        console.log('Setting opacity and scale');
        setOpacity('opacity-100');
        setScale('scale-100');
      }, 100);
    } else {
      setOpacity('opacity-0');
      setScale('scale-95');
      setTimeout(() => setVisible(false), 500);
    }
  }, [gameState?.isGameOver]);
  
  // Only render if game is over
  if (!visible || !gameState?.isGameOver) return null;
  
  console.log('Rendering GameOver component');
  
  const isWinner = gameState?.winner?.id === gameState?.player?.id;
  const winnerName = gameState?.winner?.username || 'Unknown';
  
  // Handle return to lobby
  const handleReturnToLobby = () => {
    window.location.href = '/';
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with blur */}
      <div className={`absolute inset-0 bg-black/80 backdrop-blur-lg transition-opacity duration-700 ${opacity}`}></div>
      
      {/* Main content container */}
      <div 
        className={`relative w-full max-w-2xl mx-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-700 ${opacity} ${scale}`}
      >
        {/* Top decorative bar */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600"></div>
        
        {/* Content */}
        <div className="p-8">
          {/* Game over title */}
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-white tracking-wider mb-2">GAME OVER</h2>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          </div>
          
          {/* Winner announcement */}
          <div className="text-center mb-10">
            <div className="text-2xl text-gray-300 mb-2">
              {isWinner ? 'You won!' : 'You lost!'}
            </div>
            <div className="text-4xl font-bold mb-4" style={{
              background: 'linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {isWinner ? 'Victory!' : `${winnerName} wins!`}
            </div>
            
            {/* Victory/Defeat icon */}
            <div className="text-8xl mb-6">
              {isWinner ? '🏆' : '💀'}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-center">
            <button 
              onClick={handleReturnToLobby}
              className="px-8 py-4 bg-purple-700 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors duration-200 text-xl"
            >
              Return to Lobby
            </button>
          </div>
        </div>
        
        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array(20).fill(0).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `float-up ${Math.random() * 10 + 5}s infinite linear`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Add floating animation keyframes */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity);
          }
          90% {
            opacity: var(--opacity);
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GameOver; 