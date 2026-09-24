'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SocialEmbed from '@/components/social/SocialEmbed'
import {
  detectAndValidateSocialUrl,
  parseSocialEmbedBlock,
  formatSocialEmbedBlock,
} from '@/lib/socialEmbed/validate'
import { SocialProvider, ValidatedSocialEmbed } from '@/lib/socialEmbed/types'

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
  const [localPreview, setLocalPreview] = useState<string | null>(null)
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

  // Social Embed Modal State
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [embedProviderOption, setEmbedProviderOption] = useState<SocialProvider | 'auto'>('auto')
  const [embedUrlInput, setEmbedUrlInput] = useState('')
  const [embedValidated, setEmbedValidated] = useState<ValidatedSocialEmbed | null>(null)
  const [editingTargetBlock, setEditingTargetBlock] = useState<string | null>(null)
  const [showEmbedDropdown, setShowEmbedDropdown] = useState(false)

  // Live validate embed URL
  useEffect(() => {
    if (!embedUrlInput.trim()) {
      setEmbedValidated(null)
      return
    }
    const val = detectAndValidateSocialUrl(embedUrlInput)
    setEmbedValidated(val)
  }, [embedUrlInput])

  const handleInsertEmbed = () => {
    if (!embedValidated) return
    const formattedBlock = formatSocialEmbedBlock(embedValidated)

    if (editingTargetBlock) {
      setContent((prev) => prev.replace(editingTargetBlock, formattedBlock))
      setEditingTargetBlock(null)
    } else {
      insertMarkdown(`\n\n${formattedBlock}\n\n`)
    }

    setShowEmbedModal(false)
    setEmbedUrlInput('')
    setEmbedValidated(null)
  }

  const handleRemoveEmbedBlock = (blockText: string) => {
    if (confirm('Are you sure you want to remove this social embed?')) {
      setContent((prev) => prev.replace(blockText, '').trim())
    }
  }

  const handleEditEmbedBlock = (blockText: string, currentUrl: string) => {
    setEditingTargetBlock(blockText)
    setEmbedUrlInput(currentUrl)
    setShowEmbedModal(true)
  }

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
    // 1. Instant 0ms visual preview
    try {
      const objUrl = URL.createObjectURL(file)
      setLocalPreview(objUrl)
    } catch {}

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
        setLocalPreview(null)
        setErrorMessage(data.error || 'Failed to upload image')
      }
    } catch {
      setLocalPreview(null)
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
              {(featuredImage || localPreview) && (
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedImage(null)
                    setLocalPreview(null)
                  }}
                  className="text-[11px] text-[#ffb4ab] hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>

            {(featuredImage || localPreview) ? (
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#0c1321] border border-[#232a39]">
                <Image
                  src={localPreview || featuredImage || ''}
                  alt="Featured Article Preview"
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                />

                {uploadingImage && (
                  <div className="absolute inset-0 bg-[#070e1c]/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                    <div className="w-7 h-7 border-2 border-[#ccff80] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-[#ccff80]">Uploading to server...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#0c1321]/80 backdrop-blur border border-[#232a39] text-xs font-semibold text-[#dce2f6] hover:bg-[#19202e] transition-all flex items-center gap-1.5 z-20 disabled:opacity-50"
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
                  Click or drop featured image here
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

                  {/* + Embed Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      title="Insert Social Media Embed"
                      onClick={() => setShowEmbedDropdown((prev) => !prev)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#19202e] hover:bg-[#232a39] text-[#ccff80] font-bold text-xs border border-[#232a39] transition-all"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                      <span>Embed</span>
                      <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                    </button>
                    {showEmbedDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#151b2a] border border-[#232a39] shadow-2xl py-1.5 z-40 animate-fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            setEmbedProviderOption('auto')
                            setEmbedUrlInput('')
                            setEditingTargetBlock(null)
                            setShowEmbedModal(true)
                            setShowEmbedDropdown(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#dce2f6] hover:bg-[#232a39] flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm text-[#ccff80]">auto_awesome</span>
                          <span className="font-semibold">Paste Social URL</span>
                        </button>
                        <div className="h-px bg-[#232a39] my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setEmbedProviderOption('x')
                            setEmbedUrlInput('')
                            setEditingTargetBlock(null)
                            setShowEmbedModal(true)
                            setShowEmbedDropdown(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#dce2f6] hover:bg-[#232a39] flex items-center gap-2.5"
                        >
                          <span className="text-[12px] font-bold text-white w-4 text-center">𝕏</span>
                          <span>X / Twitter</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmbedProviderOption('youtube')
                            setEmbedUrlInput('')
                            setEditingTargetBlock(null)
                            setShowEmbedModal(true)
                            setShowEmbedDropdown(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#dce2f6] hover:bg-[#232a39] flex items-center gap-2.5"
                        >
                          <span className="material-symbols-outlined text-sm text-red-500 w-4 text-center">smart_display</span>
                          <span>YouTube / Shorts</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmbedProviderOption('instagram')
                            setEmbedUrlInput('')
                            setEditingTargetBlock(null)
                            setShowEmbedModal(true)
                            setShowEmbedDropdown(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#dce2f6] hover:bg-[#232a39] flex items-center gap-2.5"
                        >
                          <span className="material-symbols-outlined text-sm text-pink-500 w-4 text-center">photo_camera</span>
                          <span>Instagram Post/Reel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmbedProviderOption('tiktok')
                            setEmbedUrlInput('')
                            setEditingTargetBlock(null)
                            setShowEmbedModal(true)
                            setShowEmbedDropdown(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#dce2f6] hover:bg-[#232a39] flex items-center gap-2.5"
                        >
                          <span className="material-symbols-outlined text-sm text-cyan-400 w-4 text-center">music_note</span>
                          <span>TikTok Video</span>
                        </button>
                      </div>
                    )}
                  </div>
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
                  <div className="space-y-4 text-body-md leading-relaxed text-[#dce2f6]/90 font-inter">
                    {content.split(/\n\s*\n/).map((block, idx) => {
                      const trimmed = block.trim()
                      if (!trimmed) return null

                      const embed =
                        parseSocialEmbedBlock(trimmed) ||
                        (trimmed.startsWith('https://') && !trimmed.includes('\n') && !trimmed.includes(' ')
                          ? detectAndValidateSocialUrl(trimmed)
                          : null)

                      if (embed) {
                        return (
                          <div
                            key={idx}
                            className="relative group border border-dashed border-[#ccff80]/40 rounded-xl p-3 bg-[#151b2a]/80 my-4"
                          >
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232a39] text-xs">
                              <span className="font-bold text-[#ccff80] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">integration_instructions</span>
                                Social Embed ({embed.provider.toUpperCase()})
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditEmbedBlock(trimmed, embed.url)}
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#232a39] hover:bg-[#323949] text-[#dce2f6] transition-colors"
                                >
                                  Edit URL
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEmbedBlock(trimmed)}
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#93000a]/30 hover:bg-[#93000a]/60 text-[#ffb4ab] transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <SocialEmbed url={embed.url} />
                          </div>
                        )
                      }

                      if (trimmed.startsWith('## ')) {
                        return (
                          <h2 key={idx} className="text-xl font-bold text-[#dce2f6] pt-4 pb-1 border-b border-[#232a39]">
                            {trimmed.replace(/^##\s+/, '')}
                          </h2>
                        )
                      }

                      if (trimmed.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="text-lg font-bold text-[#dce2f6] pt-2">
                            {trimmed.replace(/^###\s+/, '')}
                          </h3>
                        )
                      }

                      if (trimmed.startsWith('>')) {
                        return (
                          <blockquote key={idx} className="border-l-4 border-[#ccff80] pl-4 py-2 italic text-[#dce2f6] font-medium bg-[#19202e] rounded-r my-4">
                            &ldquo;{trimmed.replace(/^>\s*/gm, '')}&rdquo;
                          </blockquote>
                        )
                      }

                      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
                      if (imgMatch) {
                        const [, alt, src] = imgMatch
                        return (
                          <div key={idx} className="my-4 rounded-xl overflow-hidden border border-[#232a39] bg-[#0c1321]">
                            <div className="relative aspect-[16/9] w-full">
                              <Image src={src} alt={alt || 'Article photo'} fill unoptimized className="object-cover" />
                            </div>
                            {alt && <p className="p-2 text-center text-xs text-[#8c947c] italic">{alt}</p>}
                          </div>
                        )
                      }

                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))
                        return (
                          <ul key={idx} className="list-disc list-inside space-y-1 pl-2 text-[#dce2f6]/90">
                            {items.map((item, itemIdx) => (
                              <li key={itemIdx}>{item.replace(/^[-*]\s+/, '')}</li>
                            ))}
                          </ul>
                        )
                      }

                      return (
                        <p key={idx} className="leading-relaxed">
                          {trimmed}
                        </p>
                      )
                    })}
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

      {/* Social Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151b2a] border border-[#232a39] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#232a39] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#ccff80]">add_link</span>
                <h3 className="text-sm font-bold text-[#dce2f6]">
                  {editingTargetBlock ? 'Edit Social Media Embed' : 'Insert Social Media Embed'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEmbedModal(false)
                  setEditingTargetBlock(null)
                  setEmbedUrlInput('')
                }}
                className="text-[#8c947c] hover:text-[#dce2f6] p-1 transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0c1321] rounded-xl border border-[#232a39] flex-wrap">
              {[
                { id: 'auto', label: 'Auto Detect' },
                { id: 'x', label: '𝕏 / Twitter' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'tiktok', label: 'TikTok' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEmbedProviderOption(opt.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    embedProviderOption === opt.id
                      ? 'bg-[#232a39] text-[#ccff80] font-bold shadow-sm'
                      : 'text-[#8c947c] hover:text-[#dce2f6]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#c2cab0] font-semibold mb-1">
                  Social Post or Video URL <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="text"
                  value={embedUrlInput}
                  onChange={(e) => setEmbedUrlInput(e.target.value)}
                  placeholder={
                    embedProviderOption === 'x'
                      ? 'https://x.com/beINSPORTS/status/123456789'
                      : embedProviderOption === 'youtube'
                      ? 'https://www.youtube.com/watch?v=... or https://youtube.com/shorts/...'
                      : embedProviderOption === 'instagram'
                      ? 'https://www.instagram.com/p/... or /reel/...'
                      : embedProviderOption === 'tiktok'
                      ? 'https://www.tiktok.com/@user/video/123456789'
                      : 'Paste post URL from X, YouTube, Instagram, or TikTok'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1321] border border-[#232a39] text-xs font-mono text-[#dce2f6] placeholder-[#424936] focus:outline-none focus:border-[#ccff80]"
                  autoFocus
                />
              </div>

              {/* Validation Status */}
              {embedValidated ? (
                <div className="p-3 rounded-lg bg-[#ccff80]/10 border border-[#ccff80]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#ccff80] font-bold">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>
                      Detected: {embedValidated.provider.toUpperCase()} {embedValidated.isShorts ? '(Shorts)' : ''}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8c947c]">ID: {embedValidated.id}</span>
                </div>
              ) : embedUrlInput.trim() ? (
                <div className="p-3 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-xs text-[#ffb4ab] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">warning</span>
                  <span>Please enter a valid https link from x.com, youtube.com, instagram.com, or tiktok.com</span>
                </div>
              ) : null}

              {/* Live Preview Inside Modal */}
              {embedValidated && (
                <div className="border border-[#232a39] rounded-xl p-3 bg-[#0c1321]/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8c947c]">
                    Live Embed Preview
                  </p>
                  <div className="max-h-[320px] overflow-y-auto">
                    <SocialEmbed url={embedValidated.url} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232a39]">
              <button
                type="button"
                onClick={() => {
                  setShowEmbedModal(false)
                  setEditingTargetBlock(null)
                  setEmbedUrlInput('')
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#8c947c] hover:text-[#dce2f6] hover:bg-[#19202e] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!embedValidated}
                onClick={handleInsertEmbed}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#213600] bg-[#ccff80] hover:bg-[#b2f746] disabled:opacity-50 transition-all shadow"
              >
                {editingTargetBlock ? 'Update Embed' : 'Insert into Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
