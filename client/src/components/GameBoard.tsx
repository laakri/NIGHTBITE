import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import PlayerHand from './PlayerHand';
import Battlefield from './Battlefield';
import PlayerInfo from './PlayerInfo';
import PhaseIndicator from './PhaseIndicator';


const GameBoard = () => {
  const { gameState, playCard, endTurn } = useGame();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [detailedCard, setDetailedCard] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Guard clause when game state isn't available
  if (!gameState) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }
  
  console.log("gameState", gameState);
  console.log("lastPlayedCards structure:", JSON.stringify(gameState.lastPlayedCards, null, 2));
  
  // Helper function to transform card data to the correct format
  const transformCardData = (card: { cardId?: string; id?: string; playerId?: string; effects?: any[]; turnNumber?: number; }) => {
    // Handle cards that might have either id or cardId
    return {
      cardId: card.cardId || card.id || "",
      playerId: card.playerId || "",
      effects: card.effects || [],
      turnNumber: card.turnNumber
    };
  };
  
  const handleSelectCard = (cardId: string) => {
    setSelectedCard(cardId === selectedCard ? null : cardId);
  };

  const handlePlayCard = (cardId: string) => {
    if (!gameState.canPlayCard) return;
    playCard(cardId);
    setSelectedCard(null);
  };

  const handleViewCardDetails = (card: any) => {
    setDetailedCard(card);
    setShowCardDetails(true);
  };
  
  const handleEndTurn = () => {
    if (gameState.isYourTurn) {
      endTurn();
    }
  };

  const handleViewHistory = () => {
    console.log('View history clicked');
    setShowMenu(false);
  };

  const handleToggleSettings = () => {
    console.log('Toggle settings clicked');
    setShowMenu(false);
  };

  const handleSurrender = () => {
    console.log('Surrender clicked');
    setShowMenu(false);
  };

  return (
    <div className="relative flex flex-col w-full h-full overflow-hidden ">
      {/* Reorganize the top area to prevent overlapping */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-30 ">
        {/* Left side - Turn info */}
        <div className="text-white text-sm bg-black/30 px-3 py-1.5 rounded-md border border-gray-700/30 flex space-x-2">
          <div>Turn {gameState.turnCount}</div>
          <div>{gameState.isYourTurn ? "Your turn" : "Opponent's turn"}</div>
        </div>
        
        {/* Right side - Phase indicator */}
        <PhaseIndicator 
          currentPhase={gameState.currentPhase}
          phaseEndsIn={gameState.phaseEndsIn}
        />
      </div>
      
      {/* Main game area */}
      <div className="flex flex-col h-full pt-16">
        {/* Opponent section */}
        <div className="flex-none py-4">
          <PlayerInfo 
            username={gameState.opponent.username}
            stats={gameState.opponent.stats}
            isOpponent={true}
            handSize={gameState.opponent.handSize}
            deckSize={gameState.opponent.deckSize}
            discardPileSize={gameState.opponent.discardPileSize}
            isYourTurn={false}
            onEndTurn={() => {}}
          />
        </div>
        
        {/* Battlefield */}
        <Battlefield 
          playerCards={gameState.player.battlefield || []}
          opponentCards={gameState.opponent.battlefield || []}
          currentPhase={gameState.currentPhase}
          activeEffects={gameState.activeEffects || []}
          bloodMoonActive={!!gameState.bloodMoonActive}
          onViewCardDetails={handleViewCardDetails}
          onSelectCard={(card) => handleSelectCard(card.id)}
          selectedCard={selectedCard ? gameState.player.battlefield?.find(c => c.id === selectedCard) || null : null}
          showCardDetails={handleViewCardDetails}
          playerId={gameState.player.id}
          lastPlayedCard={gameState.lastPlayedCard}
          lastPlayedCards={gameState.lastPlayedCards?.map(card => transformCardData(card)) || []}
          turnCount={gameState.turnCount}
          isYourTurn={gameState.isYourTurn}
        />

        {/* Player section */}
        <div className="flex-none py-4">
          <PlayerInfo 
            username={gameState.player.username}
            stats={gameState.player.stats}
            isOpponent={false}
            handSize={gameState.player.hand?.length || 0}
            deckSize={gameState.player.deck?.length || 0}
            discardPileSize={gameState.player.discardPile?.length || 0}
            isYourTurn={gameState.isYourTurn}
            onEndTurn={handleEndTurn}
          />

          <PlayerHand 
            cards={gameState.player.hand || []}
            availableEnergy={gameState.player.stats.availableEnergy}
            canPlayCards={gameState.isYourTurn && gameState.canPlayCard}
            selectedCardId={selectedCard}
            onSelectCard={handleSelectCard}
            onPlayCard={handlePlayCard}
            currentPhase={gameState.currentPhase}
          />
        </div>
      </div>
      
      {/* Menu button on the right side */}
      <div className="absolute bottom-4 right-4 z-30">
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="bg-black/30 hover:bg-black/40 text-gray-300 rounded-full p-2 shadow-sm border border-gray-700/50 focus:outline-none transition-all duration-300"
            aria-label="Game menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute bottom-0 right-0 mb-2 w-40 bg-black/40 backdrop-blur-sm rounded-lg shadow-sm border border-gray-700/30 overflow-hidden transition-all duration-300">
              <div className="py-1">
                <button 
                  onClick={handleViewHistory}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800/30 flex items-center transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </button>
                <button 
                  onClick={handleToggleSettings}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800/30 flex items-center transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <button 
                  onClick={handleSurrender}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-300/80 hover:bg-gray-800/30 flex items-center transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-2 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Surrender
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed card view modal */}
      {showCardDetails && detailedCard && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
             onClick={() => setShowCardDetails(false)}>
          <div className="bg-gray-900 w-64 p-4 rounded-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-lg font-bold mb-2">{detailedCard.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{detailedCard.type} - {detailedCard.rarity}</p>
            
            <div className="flex justify-between mb-4">
              <div className="text-center">
                <span className="text-gray-400 text-xs">Cost</span>
                <span className="block text-blue-500">{detailedCard.stats.cost}</span>
                          </div>
              <div className="text-center">
                <span className="text-gray-400 text-xs">Attack</span>
                <span className="block text-red-500">{detailedCard.currentAttack || detailedCard.stats.attack}</span>
                        </div>
              <div className="text-center">
                <span className="text-gray-400 text-xs">Health</span>
                <span className="block text-green-500">{detailedCard.currentHealth || detailedCard.stats.health}</span>
            </div>
          </div>
          
            <p className="text-white text-sm mb-4">{detailedCard.description}</p>
            
            {detailedCard.effects && detailedCard.effects.length > 0 && (
              <div className="mb-4">
                <h4 className="text-gray-300 text-sm font-semibold mb-1">Effects:</h4>
                <ul className="list-disc pl-4">
                  {detailedCard.effects.map((effect: any, index: number) => (
                    <li key={index} className="text-gray-400 text-xs">
                      {effect.type} ({effect.value})
                    </li>
                  ))}
                </ul>
            </div>
            )}
          
          <button 
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mt-2"
              onClick={() => setShowCardDetails(false)}
            >
              Close
          </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;