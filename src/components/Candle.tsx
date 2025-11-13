import { motion } from 'framer-motion'

interface CandleProps {
  className?: string
  size?: number
}

export default function Candle({ className = '', size = 40 }: CandleProps) {
  const flickerVariants = {
    flicker: {
      opacity: [1, 0.8, 1, 0.9, 1],
      scale: [1, 0.98, 1, 0.99, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.div
      className={`inline-block ${className}`}
      variants={flickerVariants}
      animate="flicker"
      style={{ willChange: 'transform, opacity' }}
    >
      <svg
        width={size}
        height={size * 1.5}
        viewBox="0 0 40 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Candle body */}
        <rect x="12" y="20" width="16" height="30" rx="2" fill="#E8E8E8" />
        <rect x="14" y="22" width="12" height="26" rx="1" fill="#F5F5F5" />
        
        {/* Flame */}
        <motion.path
          d="M20 10 C18 8, 16 12, 18 14 C16 16, 20 18, 22 16 C24 18, 28 16, 26 14 C28 12, 26 8, 24 10 L20 10 Z"
          fill="#FFA500"
          animate={{
            d: [
              "M20 10 C18 8, 16 12, 18 14 C16 16, 20 18, 22 16 C24 18, 28 16, 26 14 C28 12, 26 8, 24 10 L20 10 Z",
              "M20 10 C19 8, 17 12, 19 14 C17 16, 20 18, 22 16 C24 18, 27 16, 25 14 C27 12, 25 8, 23 10 L20 10 Z",
              "M20 10 C18 8, 16 12, 18 14 C16 16, 20 18, 22 16 C24 18, 28 16, 26 14 C28 12, 26 8, 24 10 L20 10 Z",
            ],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <ellipse cx="20" cy="12" rx="3" ry="2" fill="#FFD700" opacity="0.6" />
      </svg>
    </motion.div>
  )
}

