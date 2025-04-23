// Export all components from the phaseTransitions folder

// Manager class
export { default as ThemeTransitionManager } from './ThemeTransitionManager';
export type { PhaseTheme, PhaseTransitionConfig } from './ThemeTransitionManager';

// React components
export { default as PhaseTransitionProvider, usePhaseTransition } from './PhaseTransitionProvider';
export { default as PhaseTransitionEffect } from './PhaseTransitionEffect';
export { default as PhaseTransitionDemo } from './PhaseTransitionDemo';

// Game announcements
export { default as GameAnnouncement } from './GameAnnouncement';

// Import the CSS directly to ensure it's included when importing the package
import './transitionAnimations.css';
import './announcementAnimations.css'; 