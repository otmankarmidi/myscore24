import { NextRequest, NextResponse } from 'next/server'
import { pushNotificationService, WebPushSubscriptionData } from '@/services/notifications/pushNotificationService'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    publicKey: pushNotificationService.getPublicKey(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, matchId, action = 'subscribe' } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object provided' },
        { status: 400 }
      )
    }

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      )
    }

    if (action === 'unsubscribe') {
      pushNotificationService.unsubscribe(subscription.endpoint, String(matchId))
      return NextResponse.json({
        success: true,
        action: 'unsubscribed',
        matchId: String(matchId),
      })
    }

    pushNotificationService.subscribe(subscription as WebPushSubscriptionData, String(matchId))

    return NextResponse.json({
      success: true,
      action: 'subscribed',
      matchId: String(matchId),
    })
  } catch (err: any) {
    console.error('[API /api/notifications/subscribe] Error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to process push subscription' },
      { status: 500 }
    )
  }
}
