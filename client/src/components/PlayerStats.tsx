import React, { useEffect, useState } from 'react';
import { PlayerStats as PlayerStatsType } from '../types/gameTypes';

interface PlayerStatsProps {
  stats: PlayerStatsType;
  isOpponent: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, isOpponent }) => {
  const [healthPulse, setHealthPulse] = useState(false);
  const [energyPulse, setEnergyPulse] = useState(false);
  const [shieldPulse, setShieldPulse] = useState(false);
  const [crystalPulse, setCrystalPulse] = useState(false);
  
  // Animate health when it changes
  useEffect(() => {
    setHealthPulse(true);
    const timer = setTimeout(() => setHealthPulse(false), 1000);
    return () => clearTimeout(timer);
  }, [stats.health]);
  
  // Animate energy when it changes
  useEffect(() => {
    setEnergyPulse(true);
    const timer = setTimeout(() => setEnergyPulse(false), 1000);
    return () => clearTimeout(timer);
  }, [stats.energy]);
  
  // Animate shields when they change
  useEffect(() => {
    if (stats.shields && stats.shields > 0) {
      setShieldPulse(true);
      const timer = setTimeout(() => setShieldPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [stats.shields]);
  
  // Animate crystals when they change
  useEffect(() => {
    if (stats.crystals && stats.crystals > 0) {
      setCrystalPulse(true);
      const timer = setTimeout(() => setCrystalPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [stats.crystals]);

  // Create an array of filled and empty health points
  const renderHealthBar = () => {
    const maxHealth = stats.maxHealth || 30;
    const currentHealth = stats.health || 0;
    const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${healthPulse ? 'scale-110' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                  fill="currentColor" className="text-blood-primary" />
          </svg>
        </div>
        <div className="w-full bg-gray-900/70 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`bg-gradient-to-r from-blood-primary to-red-500 h-2.5 rounded-full transition-all duration-500 ease-out ${healthPulse ? 'animate-pulse' : ''}`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
        <span className={`text-xs text-white tabular-nums transition-colors duration-300 ${healthPulse ? 'text-blood-primary' : ''}`}>
          {currentHealth}/{maxHealth}
        </span>
      </div>
    );
  };

  // Create an energy display with filled and empty crystals
  const renderEnergyBar = () => {
    const maxEnergy = stats.maxEnergy || 10;
    const currentEnergy = stats.energy || 0;
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${energyPulse ? 'scale-110' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 2v11h3v9l7-12h-4l4-8H7z" fill="currentColor" className="text-blue-400" />
          </svg>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: maxEnergy }).map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-4 rounded-sm transition-all duration-300 ${
                i < currentEnergy 
                  ? `bg-gradient-to-b from-blue-400 to-blue-600 shadow-md shadow-blue-400/20 ${energyPulse && i === currentEnergy - 1 ? 'animate-pulse' : ''}` 
                  : 'bg-gray-800'
              }`}
            ></div>
          ))}
        </div>
        <span className={`text-xs text-white tabular-nums transition-colors duration-300 ${energyPulse ? 'text-blue-400' : ''}`}>
          {currentEnergy}/{maxEnergy}
        </span>
      </div>
    );
  };

  // Render shields
  const renderShields = () => {
    if (!stats.shields || stats.shields === 0) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${shieldPulse ? 'scale-110' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" 
                  fill="currentColor" className="text-blue-500" />
          </svg>
        </div>
        <span className={`text-xs text-white transition-colors duration-300 ${shieldPulse ? 'text-blue-400' : ''}`}>
          {stats.shields}
        </span>
      </div>
    );
  };

  // Render crystals (special resource)
  const renderCrystals = () => {
    if (!stats.crystals || stats.crystals === 0) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${crystalPulse ? 'scale-110' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className="text-purple-400" />
          </svg>
        </div>
        <span className={`text-xs text-white transition-colors duration-300 ${crystalPulse ? 'text-purple-400' : ''}`}>
          {stats.crystals}
        </span>
      </div>
    );
  };

  // Render blood moon meter
  const renderBloodMoonMeter = () => {
    if (!stats.bloodMoonMeter || stats.bloodMoonMeter === 0) return null;
    
    const bloodMoonPercentage = Math.min(100, (stats.bloodMoonMeter / 100) * 100);
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
                  fill="currentColor" className="text-blood-primary" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
                  fill="currentColor" className="text-blood-primary" />
          </svg>
        </div>
        <div className="w-full bg-gray-900/70 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blood-primary to-red-900 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${bloodMoonPercentage}%` }}
          ></div>
        </div>
        <span className="text-xs text-blood-primary tabular-nums">
          {stats.bloodMoonMeter}%
        </span>
      </div>
    );
  };

  // Render blood moon charge
  const renderBloodMoonCharge = () => {
    if (!stats.bloodMoonCharge || stats.bloodMoonCharge === 0) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
                  fill="currentColor" className="text-blood-primary" />
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
                  fill="currentColor" className="text-blood-primary" />
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" 
                  fill="currentColor" className="text-red-900" />
          </svg>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-4 rounded-sm transition-all duration-300 ${
                stats.bloodMoonCharge !== undefined && i < stats.bloodMoonCharge 
                  ? 'bg-gradient-to-b from-blood-primary to-red-900 shadow-md shadow-blood-primary/20' 
                  : 'bg-gray-800'
              }`}
            ></div>
          ))}
        </div>
        <span className="text-xs text-blood-primary tabular-nums">
          {stats.bloodMoonCharge}/5
        </span>
      </div>
    );
  };

  // Render overdrive status
  const renderOverdrive = () => {
    if (!stats.inOverdrive) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 flex-shrink-0 animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z" 
                  fill="currentColor" className="text-yellow-500" />
          </svg>
        </div>
        <span className="text-xs text-yellow-500 font-medium animate-pulse">
          OVERDRIVE
        </span>
      </div>
    );
  };

  return (
    <div className={`flex flex-col space-y-2 w-full px-3 py-2 rounded-md bg-black/40 backdrop-blur-sm border ${
      isOpponent ? 'border-t border-gray-800/50' : 'border-b border-gray-800/50'
    }`}>
      {renderHealthBar()}
      {renderEnergyBar()}
      {renderBloodMoonMeter()}
      {renderBloodMoonCharge()}
      <div className="flex space-x-4">
        {renderShields()}
        {renderCrystals()}
      </div>
      {renderOverdrive()}
    </div>
  );
};

export default PlayerStats; 