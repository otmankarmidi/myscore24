import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin CMS | MyScore24',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#070e1c] text-[#dce2f6] font-sans antialiased selection:bg-[#ccff80] selection:text-[#213600]">
      {children}
    </div>
  )
}
