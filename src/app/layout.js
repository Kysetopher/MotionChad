export const metadata = {
  title: 'Wishh.ai',
  description: 'Built by two guys and a cat',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
