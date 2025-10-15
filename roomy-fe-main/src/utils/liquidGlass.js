/**
 * Liquid Glass Effect Generator
 * Based on: https://liquid-glass.andri.codes
 * 
 * Generates SVG displacement maps for real refraction effects
 */

// Surface function: Convex Squircle (Apple's favorite)
function convexSquircle(x) {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
}

// Calculate surface normal derivative
function getSurfaceDerivative(x, surfaceFunc, delta = 0.001) {
  const y1 = surfaceFunc(Math.max(0, x - delta));
  const y2 = surfaceFunc(Math.min(1, x + delta));
  return (y2 - y1) / (2 * delta);
}

// Snell's Law refraction calculation
function calculateRefraction(incidentAngle, n1, n2) {
  const sinTheta1 = Math.sin(incidentAngle);
  const ratio = n1 / n2;
  const sinTheta2Squared = ratio * ratio * sinTheta1 * sinTheta1;
  
  // Check for total internal reflection
  if (sinTheta2Squared > 1) {
    return null; // Total internal reflection
  }
  
  const sinTheta2 = Math.sqrt(sinTheta2Squared);
  const cosTheta2 = Math.sqrt(1 - sinTheta2Squared);
  
  return {
    angle: Math.asin(sinTheta2),
    cos: cosTheta2,
    sin: sinTheta2
  };
}

// Generate displacement magnitudes for one radius
function generateDisplacementMagnitudes(params) {
  const {
    bezelWidth = 0.15,      // Width of the glass bezel (0-1)
    glassThickness = 0.2,   // Thickness of glass
    refractionIndex = 1.5,  // Glass refractive index
    samples = 127           // Number of samples (max for 8-bit channel)
  } = params;
  
  const displacements = [];
  let maxDisplacement = 0;
  
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    
    if (t > bezelWidth) {
      // Beyond bezel, no displacement
      displacements.push(0);
      continue;
    }
    
    // Distance from edge (0 to 1)
    const distFromEdge = t / bezelWidth;
    
    // Surface height at this point
    const surfaceHeight = convexSquircle(distFromEdge) * glassThickness;
    
    // Calculate surface normal
    const derivative = getSurfaceDerivative(distFromEdge, convexSquircle);
    const normalX = -derivative;
    const normalY = 1;
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
    const normalXNorm = normalX / normalLength;
    const normalYNorm = normalY / normalLength;
    
    // Incident ray (straight down, orthogonal to background)
    const incidentX = 0;
    const incidentY = -1;
    
    // Calculate angle of incidence
    const dotProduct = incidentX * normalXNorm + incidentY * normalYNorm;
    const incidentAngle = Math.acos(Math.abs(dotProduct));
    
    // Apply Snell's Law (air n=1, glass n=1.5)
    const refraction = calculateRefraction(incidentAngle, 1.0, refractionIndex);
    
    if (!refraction) {
      displacements.push(0);
      continue;
    }
    
    // Calculate refracted ray direction
    const refractionAngle = refraction.angle;
    const totalAngle = incidentAngle - refractionAngle;
    
    // Calculate displacement magnitude
    const displacement = Math.tan(totalAngle) * glassThickness;
    
    displacements.push(displacement);
    maxDisplacement = Math.max(maxDisplacement, Math.abs(displacement));
  }
  
  return { displacements, maxDisplacement };
}

// Generate full displacement map image
export function generateDisplacementMap(params) {
  const {
    width = 256,
    height = 256,
    bezelWidth = 0.15,
    glassThickness = 0.2,
    refractionIndex = 1.5
  } = params;
  
  const samples = 127;
  const { displacements, maxDisplacement } = generateDisplacementMagnitudes({
    bezelWidth,
    glassThickness,
    refractionIndex,
    samples
  });
  
  // Check if we're in browser environment
  if (typeof document === 'undefined') {
    return {
      dataUrl: '',
      maxDisplacement: 0,
      canvas: null
    };
  }
  
  // Create canvas for displacement map
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(centerX, centerY);
  
  // Fill displacement map
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Normalized distance from center (0 at edge, 1 at center)
      const normalizedDist = 1 - Math.min(distance / maxRadius, 1);
      
      // Get displacement magnitude from pre-calculated array
      const sampleIndex = Math.floor((1 - normalizedDist) * samples);
      const displacement = displacements[Math.min(sampleIndex, samples)];
      
      // Normalize displacement
      const normalizedDisplacement = maxDisplacement > 0 
        ? displacement / maxDisplacement 
        : 0;
      
      // Convert to displacement vector (always pointing toward center for convex)
      const displacementX = Math.cos(angle) * normalizedDisplacement;
      const displacementY = Math.sin(angle) * normalizedDisplacement;
      
      // Convert to RGB (128 = neutral, 0 = -max, 255 = +max)
      const pixelIndex = (y * width + x) * 4;
      imageData.data[pixelIndex + 0] = 128 + displacementX * 127; // R = X
      imageData.data[pixelIndex + 1] = 128 + displacementY * 127; // G = Y
      imageData.data[pixelIndex + 2] = 128;                        // B = unused
      imageData.data[pixelIndex + 3] = 255;                        // A = opaque
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return {
    dataUrl: canvas.toDataURL(),
    maxDisplacement: maxDisplacement * maxRadius,
    canvas
  };
}

// Generate specular highlight map (rim light)
export function generateSpecularMap(params) {
  const {
    width = 256,
    height = 256,
    bezelWidth = 0.15,
    intensity = 1.0,
    lightAngle = 45      // Angle of light in degrees
  } = params;
  
  // Check if we're in browser environment
  if (typeof document === 'undefined') {
    return {
      dataUrl: '',
      canvas: null
    };
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(centerX, centerY);
  const bezelRadiusOuter = maxRadius;
  const bezelRadiusInner = maxRadius * (1 - bezelWidth);
  
  // Light direction (convert to radians)
  const lightAngleRad = (lightAngle * Math.PI) / 180;
  const lightDirX = Math.cos(lightAngleRad);
  const lightDirY = Math.sin(lightAngleRad);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Only apply to bezel area
      if (distance < bezelRadiusInner || distance > bezelRadiusOuter) {
        const pixelIndex = (y * width + x) * 4;
        imageData.data[pixelIndex + 0] = 0;
        imageData.data[pixelIndex + 1] = 0;
        imageData.data[pixelIndex + 2] = 0;
        imageData.data[pixelIndex + 3] = 0;
        continue;
      }
      
      // Calculate surface normal at this point
      const normalX = Math.cos(angle);
      const normalY = Math.sin(angle);
      
      // Calculate specular intensity (dot product with light direction)
      const dotProduct = normalX * lightDirX + normalY * lightDirY;
      const specular = Math.max(0, dotProduct);
      
      // Apply falloff based on distance from edge
      const edgeDist = (distance - bezelRadiusInner) / (bezelRadiusOuter - bezelRadiusInner);
      const falloff = Math.pow(1 - edgeDist, 2); // Quadratic falloff
      
      // Final intensity
      const finalIntensity = Math.pow(specular, 3) * falloff * intensity * 255;
      
      const pixelIndex = (y * width + x) * 4;
      imageData.data[pixelIndex + 0] = finalIntensity;
      imageData.data[pixelIndex + 1] = finalIntensity;
      imageData.data[pixelIndex + 2] = finalIntensity;
      imageData.data[pixelIndex + 3] = finalIntensity;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return {
    dataUrl: canvas.toDataURL(),
    canvas
  };
}

// Animate specular highlight rotation
export function createAnimatedSpecularMap(params) {
  const {
    width = 256,
    height = 256,
    bezelWidth = 0.15,
    intensity = 1.0,
    rotationSpeed = 0.5  // Degrees per frame at 60fps
  } = params;
  
  let currentAngle = 0;
  
  return {
    getFrame: () => {
      const map = generateSpecularMap({
        width,
        height,
        bezelWidth,
        intensity,
        lightAngle: currentAngle
      });
      
      currentAngle = (currentAngle + rotationSpeed) % 360;
      
      return map;
    },
    reset: () => {
      currentAngle = 0;
    }
  };
}

