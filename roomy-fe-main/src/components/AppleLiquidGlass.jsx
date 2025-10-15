import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Apple-Style Liquid Glass Component
 * 
 * Inspired by Apple's Liquid Glass design principles:
 * - Optical properties of glass + fluidity
 * - Dynamic material that responds to interaction
 * - Hierarchy and harmony in design
 * - Edge-to-edge content experience
 */
const AppleLiquidGlass = ({ 
  children, 
  className = '',
  intensity = 1.0,
  blur = 10,
  saturation = 1.8,
  brightness = 1.1,
  contrast = 1.1,
  disabled = false,
  interactive = true
}) => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const animationRef = useRef(null);
  
  // Dynamic properties based on interaction
  const dynamicIntensity = isPressed ? intensity * 1.3 : isHovered ? intensity * 1.1 : intensity;
  const dynamicBlur = isPressed ? blur * 1.2 : isHovered ? blur * 0.9 : blur;
  
  // Debug logging
  console.log('AppleLiquidGlass state:', { isHovered, isPressed, interactive });
  
  // Mouse tracking for dynamic effects
  const handleMouseMove = useCallback((e) => {
    if (!interactive || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    console.log('Mouse position:', { x: x.toFixed(2), y: y.toFixed(2) });
    setMousePosition({ x, y });
  }, [interactive]);
  
  const handleMouseEnter = useCallback(() => {
    if (interactive) {
      console.log('Mouse entered - hover should be active');
      setIsHovered(true);
    }
  }, [interactive]);
  
  const handleMouseLeave = useCallback(() => {
    if (interactive) {
      console.log('Mouse left - hover should be inactive');
      setIsHovered(false);
      setIsPressed(false);
      setMousePosition({ x: 0.5, y: 0.5 });
    }
  }, [interactive]);
  
  const handleMouseDown = useCallback(() => {
    if (interactive) setIsPressed(true);
  }, [interactive]);
  
  const handleMouseUp = useCallback(() => {
    if (interactive) setIsPressed(false);
  }, [interactive]);
  
  // Static positioning - no constant movement
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--dynamic-x', '0');
      containerRef.current.style.setProperty('--dynamic-y', '0');
    }
  }, []);
  
  // Check if browser supports backdrop-filter
  const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
  
  if (!supportsBackdropFilter || disabled) {
    // Fallback to CSS glassmorphism with Apple-style gradients
    return (
      <div 
        ref={containerRef}
        className={`apple-liquid-glass-fallback ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          '--mouse-x': mousePosition.x,
          '--mouse-y': mousePosition.y,
          '--intensity': dynamicIntensity,
          '--is-hovered': isHovered ? 1 : 0,
          '--is-pressed': isPressed ? 1 : 0
        }}
      >
        {children}
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`apple-liquid-glass ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        '--mouse-x': mousePosition.x,
        '--mouse-y': mousePosition.y,
        '--intensity': dynamicIntensity,
        '--blur': `${dynamicBlur}px`,
        '--saturation': saturation,
        '--brightness': brightness,
        '--contrast': contrast,
        '--is-hovered': isHovered ? 1 : 0,
        '--is-pressed': isPressed ? 1 : 0
      }}
    >
      {children}
    </div>
  );
};

export default AppleLiquidGlass;
