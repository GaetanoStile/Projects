import { motion, type HTMLMotionProps } from 'framer-motion'
import { type ReactNode } from 'react'

interface GlowWrapperProps {
  children: ReactNode
  className?: string
  glowColor?: string
  glowSpread?: string
  scale?: number
  duration?: number
  borderRadius?: string
  as?: 'div' | 'button'
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}

export default function GlowWrapper({
  children,
  className = '',
  glowColor = 'rgba(212, 175, 55, 0.3)',
  glowSpread = '60%',
  scale = 1.02,
  duration = 0.3,
  borderRadius = 'inherit',
  as = 'div',
  onClick,
  disabled,
  style,
}: GlowWrapperProps) {
  const MotionComponent = as === 'button' ? motion.button : motion.div

  const restShadow = `0 0 0 0 transparent, inset 0 0 0 0 transparent`
  const hoverShadow = `0 0 20px 4px ${glowColor}, 0 0 ${glowSpread} 0 ${glowColor}`

  const motionProps: HTMLMotionProps<'div'> & HTMLMotionProps<'button'> = {
    className: `relative ${className}`,
    style: {
      borderRadius,
      willChange: 'transform, box-shadow',
      ...style,
    },
    initial: { boxShadow: restShadow },
    whileHover: disabled
      ? {}
      : {
          scale,
          boxShadow: hoverShadow,
        },
    transition: {
      duration,
      ease: 'easeOut',
    },
    onClick,
    disabled,
  }

  return (
    <MotionComponent {...(motionProps as any)}>
      {children}
    </MotionComponent>
  )
}
