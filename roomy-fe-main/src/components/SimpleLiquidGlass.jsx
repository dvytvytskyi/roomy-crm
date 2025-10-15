import React, { useEffect, useRef, useState } from 'react';

/**
 * Simple LiquidGlass Component
 * 
 * Simplified version with basic SVG displacement for testing
 */
const SimpleLiquidGlass = ({ 
  children, 
  className = '',
  disabled = false
}) => {
  const filterId = useRef(`simple-liquid-glass-${Math.random().toString(36).substr(2, 9)}`);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Check if browser supports SVG filters as backdrop-filter
    const isChrome = /Chrome/.test(navigator.userAgent);
    
    console.log('SimpleLiquidGlass: Initializing...', {
      isChrome,
      disabled,
      userAgent: navigator.userAgent
    });
    
    if (!isChrome || disabled) {
      console.log('SimpleLiquidGlass: Using fallback (not Chrome or disabled)');
      return;
    }
    
    // Simple displacement map generation
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(256, 128);
      
      // Create simple circular displacement
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 256; x++) {
          const centerX = 128;
          const centerY = 64;
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Simple displacement - pull toward center
          const maxRadius = 60;
          const normalizedDist = Math.min(distance / maxRadius, 1);
          
          // Create displacement vector
          const displacementMagnitude = (1 - normalizedDist) * 10; // Max 10px displacement
          const displacementX = (dx / distance) * displacementMagnitude;
          const displacementY = (dy / distance) * displacementMagnitude;
          
          // Convert to RGB (128 = neutral)
          const pixelIndex = (y * 256 + x) * 4;
          imageData.data[pixelIndex + 0] = 128 + displacementX * 12.7; // R = X
          imageData.data[pixelIndex + 1] = 128 + displacementY * 12.7; // G = Y
          imageData.data[pixelIndex + 2] = 128;                        // B = unused
          imageData.data[pixelIndex + 3] = 255;                        // A = opaque
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL();
      
      console.log('SimpleLiquidGlass: Displacement map created', dataUrl ? 'Success' : 'Failed');
      setIsReady(true);
    } catch (error) {
      console.error('SimpleLiquidGlass: Error creating displacement map', error);
    }
  }, [disabled]);
  
  // Check if browser supports SVG filters as backdrop-filter
  const isChrome = /Chrome/.test(navigator.userAgent);
  
  if (!isChrome || disabled || !isReady) {
    // Fallback to CSS glassmorphism
    return (
      <div className={`liquid-glass-fallback ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <>
      {/* Simple SVG Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter 
            id={filterId.current}
            x="-50%" 
            y="-50%" 
            width="200%" 
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            {/* Simple displacement */}
            <feTurbulence
              baseFrequency="0.02"
              numOctaves="2"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            
            {/* Add some blur for smoothness */}
            <feGaussianBlur
              in="displaced"
              stdDeviation="1"
              result="final"
            />
          </filter>
        </defs>
      </svg>
      
      {/* Apply Filter */}
      <div 
        className={`liquid-glass ${className}`}
        style={{
          backdropFilter: `url(#${filterId.current})`
        }}
      >
        {children}
      </div>
    </>
  );
};

export default SimpleLiquidGlass;
