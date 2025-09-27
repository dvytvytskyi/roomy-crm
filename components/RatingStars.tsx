'use client'

import { useState } from 'react'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg'
  onRatingChange?: (rating: number) => void
  className?: string
}

export default function RatingStars({ 
  rating, 
  maxRating = 5, 
  interactive = false, 
  size = 'md',
  onRatingChange,
  className = ''
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  }

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (newRating: number) => {
    if (interactive) {
      setHoveredRating(newRating)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(0)
    }
  }

  const getStarColor = (starRating: number) => {
    const currentRating = hoveredRating || rating
    
    if (starRating <= currentRating) {
      return 'text-orange-500'
    }
    return 'text-gray-300'
  }

  const getStarHoverColor = (starRating: number) => {
    if (interactive) {
      return 'hover:text-orange-600'
    }
    return ''
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1
        return (
          <button
            key={starRating}
            onClick={() => handleClick(starRating)}
            onMouseEnter={() => handleMouseEnter(starRating)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`
              ${sizeClasses[size]} 
              ${getStarColor(starRating)} 
              ${getStarHoverColor(starRating)}
              ${interactive ? 'cursor-pointer transition-colors duration-200' : 'cursor-default'}
              font-medium
            `}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
