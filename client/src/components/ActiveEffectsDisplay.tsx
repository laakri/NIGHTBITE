import React from 'react';
import { Effect, EffectTrigger, EffectType } from '../types/gameTypes';

interface ActiveEffectsDisplayProps {
  effects: Effect[];
  showDetails?: boolean;
}

const ActiveEffectsDisplay: React.FC<ActiveEffectsDisplayProps> = ({ 
  effects,
  showDetails = false
}) => {
  // Only show effects that have duration or are triggered in the future
  const futureEffects = effects.filter(effect => 
    effect.duration > 0 || 
    effect.trigger === EffectTrigger.ON_TURN_END || 
    effect.trigger === EffectTrigger.ON_TURN_START ||
    effect.trigger === EffectTrigger.AURA
  );
  
  if (futureEffects.length === 0) return null;
  
  return (
    <div className="absolute bottom-0 right-0 flex flex-col items-end m-1">
      {futureEffects.map((effect, index) => {
        // Determine the effect color based on type
        let bgColor = 'bg-gray-700';
        let textColor = 'text-white';
        
        switch (effect.type) {
          case EffectType.HEALING:
            bgColor = 'bg-green-700';
            break;
          case EffectType.DIRECT_DAMAGE:
          case EffectType.AREA_DAMAGE:
            bgColor = 'bg-red-700';
            break;
          case EffectType.GAIN_ENERGY:
            bgColor = 'bg-yellow-700';
            break;
          case EffectType.BLOOD_DRAIN:
            bgColor = 'bg-blood-primary';
            break;
          case EffectType.VOID_DAMAGE:
          case EffectType.SHADOW_STEP:
            bgColor = 'bg-purple-700';
            break;
          case EffectType.EMPOWER:
            bgColor = 'bg-blue-700';
            break;
          case EffectType.CONSUME:
          case EffectType.STEAL_ENERGY:
            bgColor = 'bg-pink-700';
            break;
        }
        
        // Determine the trigger icon
        let triggerIcon = '⏱️';
        
        switch (effect.trigger) {
          case EffectTrigger.ON_TURN_END:
            triggerIcon = '🔄';
            break;
          case EffectTrigger.ON_TURN_START:
            triggerIcon = '▶️';
            break;
          case EffectTrigger.AURA:
            triggerIcon = '🔮';
            break;
          case EffectTrigger.ON_ATTACK:
            triggerIcon = '⚔️';
            break;
          case EffectTrigger.ON_DAMAGE:
            triggerIcon = '🛡️';
            break;
        }
        
        // Format the effect description
        let effectDesc = effect.type.replace(/_/g, ' ');
        
        if (effect.duration > 0) {
          effectDesc += ` (${effect.duration})`;
        }
        
        return (
          <div 
            key={`${effect.id}-${index}`}
            className={`${bgColor} text-xs ${textColor} rounded px-1 py-0.5 mb-1 flex items-center`}
            title={`${effect.type}: ${effect.value} - Trigger: ${effect.trigger}`}
          >
            <span className="mr-1">{triggerIcon}</span>
            {showDetails ? (
              <div className="flex flex-col">
                <span>{effect.type.replace(/_/g, ' ')}</span>
                <span className="text-xxs opacity-75">
                  {effect.duration > 0 ? `${effect.duration} turns` : ''}
                  {effect.trigger === EffectTrigger.AURA ? 'Continuous' : ''}
                </span>
              </div>
            ) : (
              <span>{effectDesc}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActiveEffectsDisplay; 