import { Metadata } from 'next'
import OfflineClient from './OfflineClient'

export const metadata: Metadata = {
  title: 'Offline | MyScore24',
  description: "You're currently offline. Please check your internet connection.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OfflinePage() {
  return <OfflineClient />
}
