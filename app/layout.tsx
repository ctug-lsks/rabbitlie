import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { PageTracker } from '@/components/page-tracker'

const anton = Anton({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-anton',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RabbitLie — OLD DENIM. BAD ATTITUDE.',
  description:
    'Túi denim thủ công độc bản 1-of-1, tái chế từ quần jeans cũ. Thời trang bền vững, cá tính. Giảm 20% cho đơn hàng đầu tiên.',
  generator: 'v0.app',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${anton.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <PageTracker />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
