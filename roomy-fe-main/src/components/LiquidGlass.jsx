import React, { useEffect, useRef, useState } from 'react';
import { generateDisplacementMap, createAnimatedSpecularMap } from '../utils/liquidGlass';

/**
 * LiquidGlass Component
 * 
 * Applies real Liquid Glass effect with SVG displacement and animated specular highlight
 */
const LiquidGlass = ({ 
  children, 
  className = '',
  bezelWidth = 0.15,
  glassThickness = 0.2,
  refractionIndex = 1.5,
  specularIntensity = 0.8,
  rotationSpeed = 0.5,
  width = 256,
  height = 256,
  disabled = false  // Fallback to simple glassmorphism
}) => {
  const filterId = useRef(`liquid-glass-${Math.random().toString(36).substr(2, 9)}`);
  const [displacementMap, setDisplacementMap] = useState(null);
  const [specularMap, setSpecularMap] = useState(null);
  const [scale, setScale] = useState(1);
  const animationRef = useRef(null);
  const specularAnimatorRef = useRef(null);
  
  useEffect(() => {
    // Check if browser supports SVG filters as backdrop-filter
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    console.log('LiquidGlass: Initializing...', {
      isChrome,
      disabled,
      userAgent: navigator.userAgent
    });
    
    if (!isChrome || disabled) {
      console.log('LiquidGlass: Using fallback (not Chrome or disabled)');
      return;
    }
    
    // Generate displacement map
    const displacement = generateDisplacementMap({
      width,
      height,
      bezelWidth,
      glassThickness,
      refractionIndex
    });
    
    console.log('LiquidGlass: Displacement map generated', {
      dataUrl: displacement.dataUrl ? 'Generated' : 'Failed',
      maxDisplacement: displacement.maxDisplacement
    });
    
    setDisplacementMap(displacement.dataUrl);
    setScale(displacement.maxDisplacement);
    
    // Create animated specular highlight
    specularAnimatorRef.current = createAnimatedSpecularMap({
      width,
      height,
      bezelWidth,
      intensity: specularIntensity,
      rotationSpeed
    });
    
    // Animation loop for specular highlight
    const animate = () => {
      if (specularAnimatorRef.current) {
        const frame = specularAnimatorRef.current.getFrame();
        setSpecularMap(frame.dataUrl);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bezelWidth, glassThickness, refractionIndex, specularIntensity, rotationSpeed, width, height, disabled]);
  
  // Check if browser supports SVG filters as backdrop-filter
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  
  if (!isChrome || disabled || !displacementMap || !specularMap) {
    // Fallback to CSS glassmorphism
    return (
      <div className={`liquid-glass-fallback ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <>
      {/* SVG Filter Definition */}
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
            {/* Load Displacement Map */}
            <feImage
              href={displacementMap}
              result="displacementMap"
              preserveAspectRatio="none"
            />
            
            {/* Apply Displacement (Refraction) */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            
            {/* Load Specular Highlight */}
            <feImage
              href={specularMap}
              result="specular"
              preserveAspectRatio="none"
            />
            
            {/* Blend Specular on top */}
            <feBlend
              in="displaced"
              in2="specular"
              mode="screen"
              result="withSpecular"
            />
            
            {/* Optional: Add subtle blur for smoothness */}
            <feGaussianBlur
              in="withSpecular"
              stdDeviation="0.5"
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

export default LiquidGlass;

