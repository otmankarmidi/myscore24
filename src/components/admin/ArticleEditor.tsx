'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Author {
  id: string
  name: string
  slug: string
}

interface ArticleEditorProps {
  initialArticleId?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ArticleEditor({ initialArticleId }: ArticleEditorProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inlineImageInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'>('DRAFT')
  const [scheduledAt, setScheduledAt] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [authorId, setAuthorId] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  // Football entities
  const [competitionId, setCompetitionId] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')
  const [playerId, setPlayerId] = useState<string>('')
  const [matchId, setMatchId] = useState<string>('')

  // Available options
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [competitionsList, setCompetitionsList] = useState<{ id: string; name: string }[]>([])
  const [teamsList, setTeamsList] = useState<{ id: string; name: string }[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingInline, setUploadingInline] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!initialArticleId)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Quick category creation modal state
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Load Categories & Authors
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, authRes, compRes, teamRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/authors'),
          fetch('/api/admin/entities?type=competitions'),
          fetch('/api/admin/entities?type=teams'),
        ])

        const catData = await catRes.json()
        const authData = await authRes.json()
        const compData = await compRes.json()
        const teamData = await teamRes.json()

        if (catData.categories) {
          setCategories(catData.categories)
          if (!categoryId && catData.categories.length > 0) {
            setCategoryId(catData.categories[0].id)
          }
        }
        if (authData.authors) {
          setAuthors(authData.authors)
          if (!authorId && authData.authors.length > 0) {
            setAuthorId(authData.authors[0].id)
          }
        }
        if (compData.items) setCompetitionsList(compData.items)
        if (teamData.items) setTeamsList(teamData.items)
      } catch (err) {
        console.error('Failed to load initial metadata', err)
      }
    }

    loadMetadata()
  }, [])

  // Load existing article if editing
  useEffect(() => {
    if (!initialArticleId) return

    const loadArticle = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/articles/${initialArticleId}`)
        const data = await res.json()
        if (data.article) {
          const a = data.article
          setTitle(a.title || '')
          setSlug(a.slug || '')
          setIsSlugManual(true)
          setExcerpt(a.excerpt || '')
          setContent(a.content || '')
          setFeaturedImage(a.featuredImage || null)
          setStatus(a.status || 'DRAFT')
          setScheduledAt(a.scheduledAt ? new Date(a.scheduledAt).toISOString().slice(0, 16) : '')
          setCategoryId(a.categoryId || '')
          setAuthorId(a.authorId || '')
          setTags(a.tags ? a.tags.map((t: any) => t.name) : [])
          setMetaTitle(a.metaTitle || '')
          setMetaDescription(a.metaDescription || '')
          setCompetitionId(a.competitionId || '')
          setTeamId(a.teamId || '')
          setPlayerId(a.playerId || '')
          setMatchId(a.matchId || '')
        } else {
          setErrorMessage(data.error || 'Failed to load article')
        }
      } catch {
        setErrorMessage('Network error while loading article')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [initialArticleId])

  // Handle auto-slug derivation
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isSlugManual) {
      setSlug(slugify(val))
    }
  }

  // Handle Featured Image Upload
  const handleFeaturedImageUpload = async (file: File) => {
    setUploadingImage(true)
    setErrorMessage(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        setFeaturedImage(data.url)
      } else {
        setErrorMessage(data.error || 'Failed to upload image')
      }
    } catch {
      setErrorMessage('Network error during image upload')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle Inline Image Upload
  const handleInlineImageUpload = async (file: File) => {
    setUploadingInline(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        insertMarkdown(`\n![${file.name.replace(/\.[^/.]+$/, '')}](${data.url})\n`)
      } else {
        alert(data.error || 'Failed to upload inline image')
      }
    } catch {
      alert('Error uploading inline image')
    } finally {
      setUploadingInline(false)
    }
  }

  // Helper for Markdown insertion at cursor
  const insertMarkdown = (syntax: string, wrap: boolean = false, placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let replacement = ''
    let newCursorPos = start

    if (wrap) {
      const textToWrap = selectedText || placeholder
      replacement = `${syntax}${textToWrap}${syntax}`
      newCursorPos = start + syntax.length + textToWrap.length
    } else {
      replacement = syntax
      newCursorPos = start + syntax.length
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 10)
  }

  // Tag management
  const handleAddTag = () => {
    const cleaned = tagInput.trim().replace(/^#/, '')
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Quick Category Creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })
      const data = await res.json()
      if (data.category) {
        setCategories([...categories, data.category])
        setCategoryId(data.category.id)
        setNewCategoryName('')
        setShowNewCategory(false)
      } else {
        alert(data.error || 'Failed to create category')
      }
    } catch {
      alert('Error creating category')
    }
  }

  // Form Submission
  const handleSave = async (overrideStatus?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED') => {
    const finalStatus = overrideStatus || status
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!title.trim()) {
      setErrorMessage('Please provide an article title.')
      return
    }

    if (finalStatus === 'SCHEDULED' && !scheduledAt) {
      setErrorMessage('Please select a scheduled date and time.')
      return
    }

    setSaving(true)

    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt: excerpt.trim() || title.trim(),
      content,
      featuredImage,
      status: finalStatus,
      scheduledAt: finalStatus === 'SCHEDULED' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      categoryId: categoryId || null,
      authorId: authorId || null,
      tags,
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || excerpt.trim(),
      competitionId: competitionId || null,
      teamId: teamId || null,
      playerId: playerId || null,
      matchId: matchId || null,
    }

    try {
      const url = initialArticleId
        ? `/api/admin/articles/${initialArticleId}`
        : '/api/admin/articles'
      const method = initialArticleId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to save article')
        setSaving(false)
        return
      }

      setSuccessMessage(
        initialArticleId ? 'Article updated successfully!' : 'Article created successfully!'
      )

      if (!initialArticleId && data.article?.id) {
        // Redirect to edit page of the new article
        router.push(`/admin/articles/${data.article.id}/edit`)
      }
    } catch {
      setErrorMessage('An unexpected error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#ccff80] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#8c947c]">Loading article details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232a39]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-lg text-[#8c947c] hover:text-[#dce2f6] hover:bg-[#19202e] border border-[#232a39] transition-all"
            title="Back to articles"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#dce2f6]">
              {initialArticleId ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-xs text-[#8c947c] mt-0.5">
              Draft, schedule, or publish football news to MyScore24
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {slug && (
            <Link
              href={`/news/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8c947c] hover:text-[#ccff80] bg-[#19202e] border border-[#232a39] transition-all"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>View Live</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSave('DRAFT')}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#dce2f6] bg-[#19202e] hover:bg-[#232a39] border border-[#232a39] transition-all disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('PUBLISHED')}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-[#213600] bg-[#ccff80] hover:bg-[#b2f746] shadow transition-all disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-[#213600] border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-sm font-bold">publish</span>
            )}
            <span>{status === 'PUBLISHED' ? 'Update Live Article' : 'Publish Now'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-[#003915]/30 border border-[#4ae176]/30 text-[#4ae176] text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content Area, 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 md:p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#c2cab0] mb-1.5">
                Article Title <span className="text-[#ffb4ab]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Manchester City Clinch Thrilling 3-2 Comeback Over Liverpool"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1321] border border-[#232a39] text-sm font-bold text-[#dce2f6] placeholder-[#424936] focus:outline-none focus:border-[#ccff80]"
              />
            </div>

            {/* Slug row */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8c947c] font-mono">/news/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value))
                  setIsSlugManual(true)
                }}
                disabled={!isSlugManual}
                placeholder="article-slug"
                className={`flex-1 px-2.5 py-1.5 rounded bg-[#0c1321] border font-mono text-xs text-[#ccff80] focus:outline-none ${
                  isSlugManual ? 'border-[#ccff80]' : 'border-[#232a39] opacity-80'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsSlugManual(!isSlugManual)}
                className="px-2.5 py-1.5 rounded bg-[#19202e] border border-[#232a39] text-[11px] text-[#c2cab0] hover:text-[#dce2f6]"
              >
                {isSlugManual ? 'Lock' : 'Edit Slug'}
              </button>
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#c2cab0]">
                Featured Image
              </label>
              {featuredImage && (
                <button
                  type="button"
                  onClick={() => setFeaturedImage(null)}
                  className="text-[11px] text-[#ffb4ab] hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>

            {featuredImage ? (
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#0c1321] border border-[#232a39]">
                <Image
                  src={featuredImage}
                  alt="Featured Article Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#0c1321]/80 backdrop-blur border border-[#232a39] text-xs font-semibold text-[#dce2f6] hover:bg-[#19202e] transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  <span>Change Image</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#232a39] hover:border-[#ccff80] transition-colors rounded-xl p-8 text-center cursor-pointer bg-[#0c1321]/40 flex flex-col items-center justify-center space-y-2"
              >
                <span className="material-symbols-outlined text-3xl text-[#8c947c]">add_photo_alternate</span>
                <p className="text-xs font-semibold text-[#dce2f6]">
                  {uploadingImage ? 'Uploading image...' : 'Click or drop featured image here'}
                </p>
                <p className="text-[11px] text-[#8c947c]">Supports JPG, PNG, WEBP, GIF up to 10MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFeaturedImageUpload(file)
              }}
            />
          </div>

          {/* Excerpt */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 md:p-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#c2cab0]">
              Excerpt / Summary
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary that appears on news cards and search snippets..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] placeholder-[#424936] focus:outline-none focus:border-[#ccff80]"
            />
          </div>

          {/* Rich Content Editor */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl overflow-hidden shadow-lg">
            {/* Toolbar & Tabs */}
            <div className="px-4 py-2.5 bg-[#0c1321] border-b border-[#232a39] flex items-center justify-between flex-wrap gap-2">
              {/* Tab toggles */}
              <div className="flex items-center gap-1 bg-[#151b2a] p-1 rounded-lg border border-[#232a39]">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 rounded text-xs font-bold tracking-wide transition-all ${
                    activeTab === 'write' ? 'bg-[#232a39] text-[#ccff80]' : 'text-[#8c947c]'
                  }`}
                >
                  Write Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded text-xs font-bold tracking-wide transition-all ${
                    activeTab === 'preview' ? 'bg-[#232a39] text-[#ccff80]' : 'text-[#8c947c]'
                  }`}
                >
                  Live Preview
                </button>
              </div>

              {/* Formatting Toolbar (shown in write mode) */}
              {activeTab === 'write' && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    title="Heading 2"
                    onClick={() => insertMarkdown('\n## Heading 2\n')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6] font-bold text-xs"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    title="Heading 3"
                    onClick={() => insertMarkdown('\n### Heading 3\n')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6] font-bold text-xs"
                  >
                    H3
                  </button>
                  <div className="h-4 w-px bg-[#232a39]" />
                  <button
                    type="button"
                    title="Bold"
                    onClick={() => insertMarkdown('**', true, 'bold text')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6] font-bold text-xs"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    title="Italic"
                    onClick={() => insertMarkdown('*', true, 'italic text')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6] italic text-xs font-serif"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    title="Link"
                    onClick={() => insertMarkdown('[link text](https://example.com)')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6]"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                  </button>
                  <div className="h-4 w-px bg-[#232a39]" />
                  <button
                    type="button"
                    title="Unordered List"
                    onClick={() => insertMarkdown('\n- Item 1\n- Item 2\n')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6]"
                  >
                    <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                  </button>
                  <button
                    type="button"
                    title="Ordered List"
                    onClick={() => insertMarkdown('\n1. First\n2. Second\n')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6]"
                  >
                    <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                  </button>
                  <button
                    type="button"
                    title="Quote"
                    onClick={() => insertMarkdown('\n> Important quote or manager reaction\n')}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#dce2f6]"
                  >
                    <span className="material-symbols-outlined text-sm">format_quote</span>
                  </button>
                  <div className="h-4 w-px bg-[#232a39]" />
                  <button
                    type="button"
                    title="Insert Image"
                    onClick={() => inlineImageInputRef.current?.click()}
                    disabled={uploadingInline}
                    className="p-1.5 rounded hover:bg-[#19202e] text-[#8c947c] hover:text-[#ccff80]"
                  >
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                  </button>
                  <input
                    ref={inlineImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleInlineImageUpload(file)
                    }}
                  />
                </div>
              )}
            </div>

            {/* Editor Area */}
            {activeTab === 'write' ? (
              <textarea
                ref={textareaRef}
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write full article content here. You can use markdown headings, lists, quotes, and images..."
                className="w-full p-4 bg-[#0c1321] text-[#dce2f6] text-sm font-sans focus:outline-none resize-y min-h-[350px] leading-relaxed placeholder-[#424936]"
              />
            ) : (
              <div className="p-6 bg-[#0c1321] min-h-[350px] text-sm text-[#dce2f6] space-y-4">
                {content ? (
                  <div className="prose prose-invert max-w-none space-y-3 whitespace-pre-wrap">
                    {content}
                  </div>
                ) : (
                  <p className="text-xs text-[#8c947c] italic">
                    Nothing to preview yet. Write some content first.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Settings, Status, Author, Category, Football Links) */}
        <div className="space-y-6">
          {/* Publication Card */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 md:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#c2cab0] border-b border-[#232a39] pb-2">
              Publishing Status
            </h3>

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                aria-label="Publishing status"
                className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs font-semibold text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {status === 'SCHEDULED' && (
              <div>
                <label className="block text-xs text-[#8c947c] mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                aria-label="Article author"
                className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[#8c947c]">Category</label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-[11px] text-[#ccff80] hover:underline"
                >
                  + Add Category
                </button>
              </div>

              {showNewCategory && (
                <div className="flex items-center gap-1.5 mb-2">
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6]"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-2.5 py-1.5 rounded bg-[#ccff80] text-[#213600] font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              )}

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="Article category"
                className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 md:p-5 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#c2cab0]">
              Tags
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg bg-[#19202e] border border-[#232a39] text-xs font-semibold text-[#dce2f6] hover:bg-[#232a39]"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#232a39] text-[#ccff80] text-xs font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#8c947c] hover:text-[#ffb4ab]"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Football Entity Linking */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 md:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#c2cab0] border-b border-[#232a39] pb-2">
              Link Football Entities
            </h3>

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Competition</label>
              <select
                value={competitionId}
                onChange={(e) => setCompetitionId(e.target.value)}
                aria-label="Link competition"
                className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              >
                <option value="">None / Neutral</option>
                {competitionsList.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                aria-label="Link team"
                className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              >
                <option value="">None / Neutral</option>
                {teamsList.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Player Identifier / Slug</label>
              <input
                type="text"
                placeholder="e.g. erling-haaland or mohamed-salah"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Match Provider Fixture ID</label>
              <input
                type="text"
                placeholder="e.g. 1208000"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              />
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-[#151b2a] border border-[#232a39] rounded-xl p-4 md:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#c2cab0] border-b border-[#232a39] pb-2">
              SEO & Social Sharing
            </h3>

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Meta Title</label>
              <input
                type="text"
                placeholder="Custom title tag (defaults to Article Title)"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8c947c] mb-1">Meta Description</label>
              <textarea
                rows={2}
                placeholder="Custom description tag (defaults to Excerpt)"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs text-[#dce2f6] focus:outline-none focus:border-[#ccff80]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
