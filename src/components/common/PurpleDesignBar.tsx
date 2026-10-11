'use client'

import React from 'react'
import styles from './PurpleDesignBar.module.css'

export interface PurpleDesignBarProps {
  /** Optional section title rendered as genuine HTML heading */
  title?: string
  /** Text direction: 'ltr' or 'rtl' (supports Arabic) */
  dir?: 'ltr' | 'rtl' | 'auto'
  /** Custom heading level (defaults to h2) */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'span'
  /** Optional additional child elements (e.g. badges, actions) */
  children?: React.ReactNode
  /** Additional CSS class names */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
  /** Accessibility label */
  ariaLabel?: string
}

export default function PurpleDesignBar({
  title,
  dir,
  headingLevel = 'h2',
  children,
  className = '',
  style,
  ariaLabel,
}: PurpleDesignBarProps) {
  const HeadingTag = headingLevel

  return (
    <div
      className={`${styles['purple-bar']} ${className}`.trim()}
      style={style}
      dir={dir}
      aria-hidden={!title && !children}
      aria-label={ariaLabel}
    >
      {title && (
        <HeadingTag className={styles['purple-bar__title']}>
          {title}
        </HeadingTag>
      )}
      {children}
    </div>
  )
}
