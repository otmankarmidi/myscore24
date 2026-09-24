import { NextRequest, NextResponse } from 'next/server'
import { isRequestAdminAuthenticated } from '@/lib/adminAuth'
import * as fs from 'fs'
import * as path from 'path'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, SVG.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum 10MB limit.' },
        { status: 400 }
      )
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'news')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate safe, unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const originalName = file.name || 'image'
    const ext = path.extname(originalName).toLowerCase() || '.jpg'
    const baseClean = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40)

    const randomSuffix = crypto.randomBytes(6).toString('hex')
    const finalFilename = `${baseClean || 'article-img'}-${Date.now()}-${randomSuffix}${ext}`
    const filePath = path.join(uploadsDir, finalFilename)

    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/news/${finalFilename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      size: file.size,
      mimeType: file.type,
    })
  } catch (err: any) {
    console.error('[Upload Error]', err)
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const fileUrl = searchParams.get('url')

    if (!fileUrl || !fileUrl.startsWith('/uploads/news/')) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 })
    }

    const filename = path.basename(fileUrl)
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'news', filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return NextResponse.json({ success: true, message: 'File deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete file' }, { status: 500 })
  }
}
