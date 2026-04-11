import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'MIT Library Management System',
  description: 'Professional Library Management Portal for MIT College',
  icons: {
    icon: '/assets/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-navy">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
