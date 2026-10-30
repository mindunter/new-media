import { motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  delay?: number
  className?: string
}

/**
 * Fades its children in once, when they scroll into view. If a fast scroll or
 * a jump skips past them, they appear anyway after a moment, so content is
 * never left hidden.
 */
export function Reveal({ children, delay = 0, className }: Props) {
  const [forced, setForced] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setForced(true), 1800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={forced ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
