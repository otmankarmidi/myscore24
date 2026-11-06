'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  threshold?: number
  delay?: number
  direction?: 'up' | 'down' | 'none'
}

/**
 * ScrollReveal Component
 * Smoothly reveals content when scrolled into the viewport with an elegant fade-in-up effect
 * and supports smooth hover lift/glow transitions.
 */
export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.1,
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // If browser doesn't support IntersectionObserver, reveal immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  const initialTransform =
    direction === 'up'
      ? 'translate3d(0, 24px, 0)'
      : direction === 'down'
      ? 'translate3d(0, -24px, 0)'
      : 'none'

  return (
    <div
      ref={ref}
      className={`scroll-reveal-item ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : initialTransform,
        transition: `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
