import type { Metadata } from 'next'
import '../styles/tailwind.css'
import '../styles/animations.css'
import Header from '../components/layout/Header'

export const metadata: Metadata = {
  title: 'BeautyFeed - Makeup & Beauty',
  description: 'Découvre les meilleurs looks makeup et achète les produits utilisés',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}