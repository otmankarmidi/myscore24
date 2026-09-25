// Web Audio API Synthesized Alerts for Live Football Match Events
// No external mp3 dependencies, lightweight, zero 404 risk, works across browsers and mobile devices.

class SoundAlertManager {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          this.ctx = new AudioCtx()
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      return this.ctx
    } catch {
      return null
    }
  }

  /**
   * Goal Sound: Joyful ascending harmonic fanfare (C5 -> E5 -> G5)
   */
  playGoalSound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)

        gain.gain.setValueAtTime(0, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 0.36)
      })
    } catch {
      // Audio block or error ignored
    }
  }

  /**
   * Penalty Sound: Dramatic high-alert pulsing tones
   */
  playPenaltySound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const pulses = [587.33, 880.0] // D5, A5
      pulses.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, now + idx * 0.15)

        gain.gain.setValueAtTime(0, now + idx * 0.15)
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.15 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.28)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.15)
        osc.stop(now + idx * 0.15 + 0.3)
      })
    } catch {
      // Audio block or error ignored
    }
  }

  /**
   * Card Sound: Sharp referee double whistle (880Hz / 1760Hz bursts)
   */
  playCardSound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const bursts = [0, 0.16]
      bursts.forEach((timeOffset) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(1480, now + timeOffset)

        gain.gain.setValueAtTime(0, now + timeOffset)
        gain.gain.linearRampToValueAtTime(0.2, now + timeOffset + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.12)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + timeOffset)
        osc.stop(now + timeOffset + 0.13)
      })
    } catch {
      // Audio block or error ignored
    }
  }

  /**
   * Match Status Whistle (Start / Full Time)
   */
  playWhistleSound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.linearRampToValueAtTime(1600, now + 0.1)
      osc.frequency.setValueAtTime(1400, now + 0.25)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.46)
    } catch {
      // Audio block or error ignored
    }
  }

  /**
   * Gentle activation chirp when user turns on notifications
   */
  playToggleSound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12) // A5

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.16)
    } catch {
      // Audio block or error ignored
    }
  }
}

export const soundAlerts = new SoundAlertManager()
