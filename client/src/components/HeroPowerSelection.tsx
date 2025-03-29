import { useState } from 'react'
import { useGame } from '../contexts/GameContext'

const HeroPowerSelection = () => {
  const { selectHeroPower } = useGame()
  const [selectedPower, setSelectedPower] = useState<string | null>(null)
  
  const heroPowers = [
    {
      id: 'Dawncaller',
      name: 'Dawncaller',
      description: 'First Sun card each turn costs 1 less Energy',
      icon: '☀️',
      color: 'from-sun-primary to-sun-secondary'
    },
    {
      id: 'Midnight Reaper',
      name: 'Midnight Reaper',
      description: 'Deal 2 damage when you discard a card',
      icon: '🌙',
      color: 'from-moon-primary to-moon-secondary'
    },
    {
      id: 'Eclipse Wanderer',
      name: 'Eclipse Wanderer',
      description: 'Draw a card whenever the phase changes',
      icon: '🌓',
      color: 'from-eclipse-primary to-eclipse-secondary'
    }
  ]
  
  const handleSelectPower = () => {
    if (selectedPower) {
      selectHeroPower(selectedPower)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80">
      <div className="w-[600px] p-8 bg-[#0A0A10] rounded-xl border border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">
          Choose Your Hero Power
        </h2>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          {heroPowers.map(power => (
            <div 
              key={power.id}
              onClick={() => setSelectedPower(power.id)}
              className={`p-4 transition-all duration-300 rounded-lg border-2 cursor-pointer ${
                selectedPower === power.id 
                  ? `border-${power.color.split(' ')[0].replace('from-', '')} shadow-[0_0_15px_rgba(156,78,214,0.3)]` 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${power.color} flex items-center justify-center text-2xl`}>
                {power.icon}
              </div>
              
              <h3 className="mb-2 text-lg font-bold text-center text-white">
                {power.name}
              </h3>
              
              <p className="text-sm text-center text-gray-400">
                {power.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={handleSelectPower}
            disabled={!selectedPower}
            className={`px-6 py-3 text-white rounded-md transition-all ${
              selectedPower 
                ? 'bg-gradient-to-r from-[#9C4ED6] to-[#7E3EB0] hover:shadow-[0_0_15px_rgba(156,78,214,0.3)] hover:-translate-y-1' 
                : 'bg-gray-800 cursor-not-allowed'
            }`}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}

export default HeroPowerSelection 