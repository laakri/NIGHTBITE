import React, { useState, useEffect, useRef } from 'react';
import { Card as CardType, CardRarity, CardType as CardTypeEnum, Phase } from '../types/gameTypes';
import * as THREE from 'three';
// Import a default card image
import defaultCardImage from "../assets/cards/default.jpg";
import attack_bg from "../assets/HUI/attack_bg.png";
import health_bg from "../assets/HUI/health_bg.png";
import blood_energy_bg from "../assets/HUI/blood_energy_bg.png";
import ActiveEffectsDisplay from './ActiveEffectsDisplay';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  canPlay: boolean;
  onPlay: () => void;
  availableEnergy?: number;
  currentPhase?: Phase;
}

// Helper function to get glow class based on card type
const getCardTypeGlowClass = (cardType: CardTypeEnum): string => {
  switch (cardType) {
    case CardTypeEnum.BLOOD:
      return 'shadow-blood-glow';
    case CardTypeEnum.VOID:
      return 'shadow-void-glow';
    case CardTypeEnum.WARRIOR:
      return 'shadow-warrior-glow';
    case CardTypeEnum.MAGE:
      return 'shadow-mage-glow';
    case CardTypeEnum.ASSASSIN:
      return 'shadow-assassin-glow';
    case CardTypeEnum.BEAST:
      return 'shadow-beast-glow';
    case CardTypeEnum.CELESTIAL:
      return 'shadow-celestial-glow';
    default:
      return 'shadow-white-glow';
  }
};

const Card: React.FC<CardProps> = ({ 
  card, 
  isSelected, 
  canPlay, 
  onPlay, 
  availableEnergy = 0,
  currentPhase = Phase.Normal
}) => {
  // State to store the card image
  const [cardImage, setCardImage] = useState<string>(defaultCardImage);
  // State to track hover for enhanced effects
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  // Refs for animation containers
  const fireEffectRef = useRef<HTMLDivElement>(null);
  const lightningEffectRef = useRef<HTMLDivElement>(null);
  const particleEffectRef = useRef<HTMLDivElement>(null);
  
  // Refs for THREE.js effects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  
  // Load the card image based on the card ID
  useEffect(() => {
    const loadCardImage = async () => {
      try {
        // Try to import the image based on the card ID
        const imageModule = await import(`../assets/cards/${card.id_name}.png`);
        setCardImage(imageModule.default);
      } catch (error) {
        // If the image import fails, use the default image
        console.warn(`Card image for ID ${card.id_name} not found, using default image`);
        setCardImage(defaultCardImage);
      }
    };
    
    loadCardImage();
  }, [card.id_name]);
  
  // Initialize THREE.js particle effect
  useEffect(() => {
    if (!particleEffectRef.current) return;
    
    // Only initialize the effect when the card is selected or hovered
    if (!isSelected && !isHovered) return;
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    
    renderer.setSize(300, 400);
    particleEffectRef.current.innerHTML = '';
    particleEffectRef.current.appendChild(renderer.domElement);
    renderer.setClearColor(0x000000, 0);
    
    // Create particle effect based on card type
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Generate particles with different colors based on card type
    let particleColor: THREE.Color;
    let speedFactor = 0.01;
    
    switch (card.type) {
      case CardTypeEnum.BLOOD:
        particleColor = new THREE.Color(0xff3333);
        speedFactor = 0.02;
        break;
      case CardTypeEnum.VOID:
        particleColor = new THREE.Color(0x9933ff);
        speedFactor = 0.015;
        break;
      case CardTypeEnum.NETHER:
        particleColor = new THREE.Color(0x33ff99);
        speedFactor = 0.01;
        break;
      default:
        particleColor = new THREE.Color(0xffffff);
        speedFactor = 0.005;
    }
    
    for (let i = 0; i < particleCount; i++) {
      // Create particles in a circular pattern around the card
      const radius = 3 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Apply the color with some variation
      colors[i * 3] = particleColor.r + Math.random() * 0.2 - 0.1;
      colors[i * 3 + 1] = particleColor.g + Math.random() * 0.2 - 0.1;
      colors[i * 3 + 2] = particleColor.b + Math.random() * 0.2 - 0.1;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create particle material based on card rarity
    let particleSize = 0.02;
    
    const particleMaterial = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Position the camera
    camera.position.z = 4;
    
    // Animation function
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Rotate the particle system
      particleSystem.rotation.x += 0.001;
      particleSystem.rotation.y += 0.002;
      
      // Update particle positions based on card type
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        
        // Different movement patterns based on card type
        switch (card.type) {
          case CardTypeEnum.BLOOD:
            // Blood - pulsating movement
            positions[idx] *= 1 + Math.sin(Date.now() * 0.001) * 0.003;
            positions[idx+1] *= 1 + Math.sin(Date.now() * 0.002) * 0.003;
            positions[idx+2] *= 1 + Math.sin(Date.now() * 0.003) * 0.003;
            break;
          case CardTypeEnum.VOID:
            // Void - swirling movement
            const angle = Date.now() * 0.001;
            const radius = Math.sqrt(positions[idx]**2 + positions[idx+1]**2);
            positions[idx] = Math.cos(angle + i * 0.01) * radius;
            positions[idx+1] = Math.sin(angle + i * 0.01) * radius;
            break;
          case CardTypeEnum.NETHER:
            // Nether - chaotic movement
            positions[idx] += (Math.random() - 0.5) * 0.01;
            positions[idx+1] += (Math.random() - 0.5) * 0.01;
            positions[idx+2] += (Math.random() - 0.5) * 0.01;
            
            // Keep particles within bounds
            const dist = Math.sqrt(positions[idx]**2 + positions[idx+1]**2 + positions[idx+2]**2);
            if (dist > 5) {
              positions[idx] *= 0.95;
              positions[idx+1] *= 0.95;
              positions[idx+2] *= 0.95;
            }
            break;
          default:
            // Default - gentle movement
            positions[idx] += (Math.random() - 0.5) * 0.005;
            positions[idx+1] += (Math.random() - 0.5) * 0.005;
            positions[idx+2] += (Math.random() - 0.5) * 0.005;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      
      // Render the scene
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    particlesRef.current = particleSystem;
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (particleEffectRef.current) {
        particleEffectRef.current.innerHTML = '';
      }
    };
  }, [isSelected, isHovered, card.type, card.rarity]);
  
  // Create lightning effect for VOID cards when selected - MODIFIED
  useEffect(() => {
    if (!lightningEffectRef.current) return;
    if (card.type !== CardTypeEnum.VOID || (!isSelected && !isHovered)) {
      if (lightningEffectRef.current) {
        lightningEffectRef.current.innerHTML = '';
      }
      return;
    }
    
    // Generate SVG lightning bolts - with modified positioning
    const width = 300;
    const height = 400;
    
    const createLightningPath = () => {
      // Modified to keep lightning primarily in the upper portion of the card
      // Avoid the bottom part where text and stats are
      const startX = width / 2 + (Math.random() * 80 - 40);
      const startY = -20;
      let path = `M${startX},${startY} `;
      
      let x = startX;
      let y = startY;
      
      // Fewer segments and limit the height to 60% of card height
      const segments = 4 + Math.floor(Math.random() * 3);
      const maxDeviation = 40;
      const maxHeight = height * 0.6; // Limit to top 60% of card
      
      for (let i = 1; i < segments; i++) {
        const newY = startY + (maxHeight) * (i / segments);
        const newX = startX + (Math.random() * maxDeviation * 2 - maxDeviation);
        
        path += `L${newX},${newY} `;
        x = newX;
        y = newY;
      }
      
      return path;
    };
    
    const createLightningBolt = () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
      svg.style.position = 'absolute';
      svg.style.top = '-20px';
      svg.style.left = '-20px';
      svg.style.pointerEvents = 'none';
      
      const lightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      lightning.setAttribute('d', createLightningPath());
      lightning.setAttribute('stroke', '#a855f7');
      lightning.setAttribute('stroke-width', '2'); // Reduced width
      lightning.setAttribute('fill', 'none');
      lightning.style.filter = 'drop-shadow(0 0 3px #a855f7)'; // Reduced glow
      
      // Reduced opacity
      lightning.setAttribute('stroke-opacity', '0.7');
      
      // Animation with less frequent updates
      const animate = () => {
        lightning.setAttribute('d', createLightningPath());
        lightning.setAttribute('stroke-width', (1 + Math.random() * 1.5).toString()); // Thinner lightning
        lightning.setAttribute('stroke-opacity', (0.5 + Math.random() * 0.3).toString()); // More transparent
        setTimeout(animate, 300 + Math.random() * 400); // Slower animation
      };
      
      svg.appendChild(lightning);
      
      if (lightningEffectRef.current) {
        lightningEffectRef.current.appendChild(svg);
      }
      
      setTimeout(animate, 200);
    };
    
    // Clear existing content
    if (lightningEffectRef.current) {
      lightningEffectRef.current.innerHTML = '';
    }
    
    // Create fewer lightning bolts - reduced from 3 to 2 for selected, 1 for hover
    const boltCount = isSelected ? 2 : 1;
    for (let i = 0; i < boltCount; i++) {
      setTimeout(() => createLightningBolt(), i * 150);
    }
    
  }, [isSelected, isHovered, card.type]);
  
  // Create fire effect for BLOOD cards when selected
  useEffect(() => {
    if (!fireEffectRef.current) return;
    if (card.type !== CardTypeEnum.BLOOD || (!isSelected && !isHovered)) {
      if (fireEffectRef.current) {
        fireEffectRef.current.innerHTML = '';
      }
      return;
    }
    
    // Create canvas for fire effect
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 380;
    canvas.style.position = 'absolute';
    canvas.style.top = '-20px';
    canvas.style.left = '-20px';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear existing content
    if (fireEffectRef.current) {
      fireEffectRef.current.innerHTML = '';
      fireEffectRef.current.appendChild(canvas);
    }
    
    // Fire particles
    const particles: {x: number, y: number, vx: number, vy: number, radius: number, alpha: number, decay: number}[] = [];
    
    // Create particles
    const createParticles = () => {
      // Create more particles for selected cards
      const particleCount = isSelected ? 5 : 2;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: 150 + Math.random() * 100 - 50,
          y: 400 + Math.random() * 20,
          vx: Math.random() * 2 - 1,
          vy: -2 - Math.random() * 3,
          radius: 10 + Math.random() * 20,
          alpha: 0.5 + Math.random() * 0.3,
          decay: 0.01 + Math.random() * 0.015
        });
      }
    };
    
    // Animation loop
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create new particles
      createParticles();
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.radius *= 0.99;
        
        // Remove dead particles
        if (p.alpha <= 0 || p.radius <= 1) {
          particles.splice(i, 1);
          i--;
          continue;
        }
        
        // Create fire gradient
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(255, 50, 0, ${p.alpha})`);
        gradient.addColorStop(0.4, `rgba(255, 100, 0, ${p.alpha * 0.6})`);
        gradient.addColorStop(0.8, `rgba(255, 50, 0, ${p.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    const animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (fireEffectRef.current) {
        fireEffectRef.current.innerHTML = '';
      }
    };
  }, [isSelected, isHovered, card.type]);
  
  // Get rarity styles with enhanced visual effects
  const getRarityStyles = () => {
    switch (card.rarity) {
      case CardRarity.LEGENDARY:
        return 'ring-2 ring-amber-500 shadow-amber-500/30';
      case CardRarity.EPIC:
        return 'ring-2 ring-purple-500 shadow-purple-500/30';
      case CardRarity.RARE:
        return 'ring-2 ring-blue-500 shadow-blue-500/30';
      case CardRarity.MYTHIC:
        return 'ring-2 ring-fuchsia-500 shadow-fuchsia-500/30';
      case CardRarity.COMMON:
      default:
        return 'ring-1 ring-gray-500 shadow-gray-500/20';
    }
  };

  // Get card type color
  const getTypeColor = () => {
    switch (card.type) {
      case CardTypeEnum.BLOOD:
        return 'bg-red-950/80 text-red-200 border-l-2 border-red-700';
      case CardTypeEnum.VOID:
        return 'bg-purple-950/80 text-purple-200 border-l-2 border-purple-700';
      case CardTypeEnum.NETHER:
        return 'bg-emerald-950/80 text-emerald-200 border-l-2 border-emerald-700';
      default:
        return 'bg-gray-950/80 text-gray-200 border-l-2 border-gray-700';
    }
  };

  // Get rarity badge style
  const getRarityBadgeStyle = () => {
    switch (card.rarity) {
      case CardRarity.LEGENDARY:
        return 'bg-amber-950/80 text-amber-200 border-r-2 border-amber-700';
      case CardRarity.EPIC:
        return 'bg-purple-950/80 text-purple-200 border-r-2 border-purple-700';
      case CardRarity.RARE:
        return 'bg-blue-950/80 text-blue-200 border-r-2 border-blue-700';
      case CardRarity.MYTHIC:
        return 'bg-fuchsia-950/80 text-fuchsia-200 border-r-2 border-fuchsia-700';
      case CardRarity.COMMON:
      default:
        return 'bg-gray-950/80 text-gray-200 border-r-2 border-gray-700';
    }
  };

  // Check if the card requires energy (only Blood Moon cards)
  const requiresEnergy = card.type === CardTypeEnum.BLOOD;
  
  // Check if the card can be played based on energy requirements
  const hasEnoughEnergy = !requiresEnergy || (requiresEnergy && card.stats.bloodMoonCost && card.stats.bloodMoonCost <= availableEnergy);

  return (
    <div
      className="relative w-56 h-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* THREE.js particle effects container - positioned behind the card */}
      <div 
        ref={particleEffectRef}
        className="absolute -inset-12 z-0 pointer-events-none"
      />
      
      {/* Lightning effect container for VOID cards - MODIFIED to use top portion only */}
      <div 
        ref={lightningEffectRef}
        className="absolute inset-0 top-0 bottom-0 z-10 pointer-events-none overflow-visible"
      />
      
      {/* Fire effect container for BLOOD cards */}
      <div 
        ref={fireEffectRef}
        className="absolute -inset-5 z-10 pointer-events-none overflow-visible"
      />
      
      {/* The actual card */}
      <div
        className={`relative w-full h-full rounded-lg overflow-hidden transform transition-all duration-300
          ${isSelected ? 'scale-105 shadow-xl z-10' : isHovered ? 'scale-103' : ''}
          ${canPlay && hasEnoughEnergy ? 'cursor-pointer' : 'opacity-70'} 
          ${getRarityStyles()}`}
        onClick={canPlay && hasEnoughEnergy ? onPlay : undefined}
      >
        {/* Card background with image - full size */}
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src={cardImage} 
            alt={card.name}
            className="w-full h-full object-cover object-center transition-transform duration-700"
            style={{ 
              objectPosition: "center 30%",
              transform: isHovered || isSelected ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* Add subtle darkening overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Top badges - just type and rarity in top right */}
        <div className="relative flex justify-end p-2 gap-1 z-20">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTypeColor()} backdrop-blur-sm`}>
            {card.type}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm ${getRarityBadgeStyle()}`}>
            {card.rarity}
          </span>
        </div>
        
        {/* Energy cost - only show for Blood Moon cards */}
        {requiresEnergy && (
          <div className="absolute top-1 left-1 z-20">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <img src={blood_energy_bg} alt="energy" className="w-full h-full absolute inset-0" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-white font-bold text-lg drop-shadow-md">{card.stats.bloodMoonCost || 0}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Card footer - enhanced gradient and effects with increased z-index */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/90 to-black/50 pb-2 px-3 z-30 backdrop-blur-sm">
          {/* Card title - with enhanced text shadow and improved visibility */}
          <h3 className="text-white font-bold text-base mb-1 drop-shadow-lg">
            {card.name}
          </h3>
          
          {/* Card description with better text rendering and visibility */}
          <div className={`text-sm text-gray-100 font-medium mb-3 drop-shadow-lg ${isSelected ? '' : 'line-clamp-2'}`}>
            {card.description}
          </div>
          
          {/* Card stats with enhanced styling */}
          <div className="flex justify-between">
            {/* Attack stat with background image */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <img src={attack_bg} alt="attack" className="w-full h-full absolute inset-0" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-white font-bold text-lg drop-shadow-md">{card.stats.attack}</div>
              </div>
            </div>
            
            {/* Health stat with background image */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <img src={health_bg} alt="health" className="w-full h-full absolute inset-0" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-white font-bold text-lg drop-shadow-md">{card.stats.health}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Play button with enhanced styling and highest z-index */}
        {isSelected && canPlay && hasEnoughEnergy && (
          <button
            onClick={onPlay}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-40
                    px-4 py-1 bg-black/80 text-gray-200 
                    rounded-md text-sm font-medium border border-gray-700
                    hover:bg-gray-800 hover:text-white transition-all duration-200
                    backdrop-blur-md shadow-lg hover:shadow-xl"
          >
            Summon
          </button>
        )}
        
        {/* Energy requirement indicator with highest z-index */}
        {isSelected && canPlay && !hasEnoughEnergy && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-40
                    px-4 py-1 bg-red-900/80 text-red-200 
                    rounded-md text-sm font-medium border border-red-700
                    backdrop-blur-md shadow-lg">
            Need {card.stats.bloodMoonCost} Blood Energy
          </div>
        )}
        
        {/* Add the ActiveEffectsDisplay component */}
        {card.effects && card.effects.length > 0 && (
          <ActiveEffectsDisplay 
            effects={card.effects}
            showDetails={isHovered || isSelected}
          />
        )}
        
        {/* Hover effect glow based on card type */}
        {isHovered && (
          <div 
            className={`absolute inset-0 z-0 ${getCardTypeGlowClass(card.type)}`}
          />
        )}
        
        {/* Energy cost indicator */}
        {requiresEnergy && card.stats.bloodMoonCost && (
          <div className={`absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-full ${hasEnoughEnergy ? 'bg-blood-primary' : 'bg-gray-700'} text-white text-sm font-bold`}>
            {card.stats.bloodMoonCost}
          </div>
        )}
      </div>
      
      {/* Effect duration indicators */}
      {isHovered && card.effects && card.effects.some(e => e.duration > 0) && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
          <div className="px-2 py-1 bg-black/80 text-white text-xs rounded-md">
            Contains timed effects
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;