import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter: IP -> timestamps[]
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps)
    return true
  }

  validTimestamps.push(now)
  rateLimitMap.set(ip, validTimestamps)
  return false
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting by client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait a few minutes before trying again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, subject, message, website_hp } = body

    // 2. Honeypot check for bots (hidden field must be empty)
    if (website_hp) {
      return NextResponse.json({ success: true, message: 'Message received.' })
    }

    // 3. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Please provide a valid name (2–100 characters).' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 150) {
      return NextResponse.json(
        { error: 'Please specify a valid subject or enquiry category.' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 3,000 characters.' },
        { status: 400 }
      )
    }

    // 4. Log or queue securely (no secrets exposed)
    console.log(`[Contact Form] New enquiry from ${name.trim()} <${email.trim()}>: [${subject.trim()}]`)

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will review it and follow up at contact@myscore24.com.',
    })
  } catch (err) {
    console.error('[Contact Form API Error]', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending your message. Please try again or email contact@myscore24.com directly.' },
      { status: 500 }
    )
  }
}
