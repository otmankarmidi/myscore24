'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export interface IndicatorRect {
  left: number
  width: number
  top: number
  height: number
  ready: boolean
}

/**
 * Measures the child marked `data-active="true"` inside the returned container ref,
 * so a single absolutely-positioned indicator can glide between options.
 */
export function useSlidingIndicator<T extends HTMLElement>(activeKey: unknown) {
  const ref = useRef<T>(null)
  const [rect, setRect] = useState<IndicatorRect>({ left: 0, width: 0, top: 0, height: 0, ready: false })

  const measure = useCallback(() => {
    const el = ref.current?.querySelector<HTMLElement>('[data-active="true"]')
    if (!el) {
      setRect((r) => ({ ...r, width: 0 }))
      return
    }
    setRect({ left: el.offsetLeft, width: el.offsetWidth, top: el.offsetTop, height: el.offsetHeight, ready: true })
  }, [])

  useLayoutEffect(() => {
    measure()
    const container = ref.current
    if (!container || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [activeKey, measure])

  // Skip the transition on the very first placement so the indicator doesn't fly in from 0
  const [animate, setAnimate] = useState(false)
  useLayoutEffect(() => {
    if (!rect.ready || animate) return
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [rect.ready, animate])

  const style = {
    transform: `translateX(${rect.left}px)`,
    width: rect.width,
    opacity: rect.ready && rect.width ? 1 : 0,
    transition: animate ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease' : 'none',
  } as const

  return { ref, rect, style }
}
