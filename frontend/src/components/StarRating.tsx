"use client"

import { Star } from "lucide-react"
import { useState } from "react"

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: number
    interactive?: boolean
    onChange?: (rating: number) => void
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 20,
    interactive = false,
    onChange
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0)

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value)
        }
    }

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value)
        }
    }

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0)
        }
    }

    const displayRating = hoverRating || rating

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1
                const isFilled = starValue <= displayRating
                const isHalf = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => handleMouseEnter(starValue)}
                        onMouseLeave={handleMouseLeave}
                        disabled={!interactive}
                        className={`relative ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
                    >
                        {isHalf ? (
                            <div className="relative" style={{ width: size, height: size }}>
                                <Star size={size} className="text-gray-300 absolute" />
                                <div className="overflow-hidden absolute" style={{ width: `${size / 2}px` }}>
                                    <Star size={size} className="text-yellow-400 fill-yellow-400" />
                                </div>
                            </div>
                        ) : (
                            <Star
                                size={size}
                                className={isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                            />
                        )}
                    </button>
                )
            })}
            {!interactive && rating > 0 && (
                <span className="ml-2 text-sm text-gray-600 font-medium">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    )
}
