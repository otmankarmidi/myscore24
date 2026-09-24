import ArticleEditor from '@/components/admin/ArticleEditor'

export const dynamic = 'force-dynamic'

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params
  return <ArticleEditor initialArticleId={id} />
}
