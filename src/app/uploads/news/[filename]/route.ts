import { NextRequest, NextResponse } from 'next/server'
import { getUploadedFileAsync } from '@/lib/storage'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ filename: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { filename } = await context.params

  if (!filename) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const file = await getUploadedFileAsync(filename)

  if (!file) {
    return new NextResponse('File not found', { status: 404 })
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    status: 200,
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(file.buffer.length),
    },
  })
}
