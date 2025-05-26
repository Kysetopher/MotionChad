export const metadata = {
  title: 'AI Starter',
  description: 'Boilerplate AI productivity app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
