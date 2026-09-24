import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRequestAdminAuthenticated } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    })
    return NextResponse.json({ authors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, role, avatar, bio } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 })
    }

    const slug = slugify(name)
    const existing = await prisma.author.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Author with this name or slug already exists' }, { status: 409 })
    }

    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        slug,
        role: role?.trim() || 'Staff Writer',
        avatar: avatar?.trim() || null,
        bio: bio?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, author })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
