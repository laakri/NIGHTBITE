import React from 'react'

interface HeroPowerDisplayProps {
  power: string
}

const HeroPowerDisplay: React.FC<HeroPowerDisplayProps> = ({ power }) => {
  // Define icon and color based on power
  let icon = '⚡'
  let color = 'bg-gray-700'
  let description = ''
  
  switch (power) {
    case 'Dawncaller':
      icon = '☀️'
      color = 'bg-gradient-to-br from-sun-primary to-sun-secondary'
      description = 'First Sun card each turn costs 1 less Energy'
      break
    case 'Midnight Reaper':
      icon = '🌙'
      color = 'bg-gradient-to-br from-moon-primary to-moon-secondary'
      description = 'Deal 2 damage when you discard a card'
      break
    case 'Eclipse Wanderer':
      icon = '🌓'
      color = 'bg-gradient-to-br from-eclipse-primary to-eclipse-secondary'
      description = 'Draw a card whenever the phase changes'
      break
  }
  
  return (
    <div className="flex items-center p-2 bg-black/40 backdrop-blur-sm rounded-lg border border-gray-800 hover:border-gray-600 transition-colors group">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} mr-2`}>
        <span>{icon}</span>
      </div>
      <div className="text-xs text-white font-medium">{power}</div>
      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-2 bg-black/90 backdrop-blur-sm rounded border border-gray-700 text-xs text-white w-48 z-10">
        {description}
      </div>
    </div>
  )
}

export default HeroPowerDisplay 