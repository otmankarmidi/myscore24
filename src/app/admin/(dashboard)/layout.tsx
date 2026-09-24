import { redirect } from 'next/navigation'
import { isServerAdminAuthenticated } from '@/lib/adminAuth'
import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuth = await isServerAdminAuthenticated()

  if (!isAuth) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070e1c] text-[#dce2f6]">
      <AdminNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
