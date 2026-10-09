import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="page text-center">
      <h1 className="page-title mt-16">Page not found</h1>
      <p className="mt-3 text-muted">This page does not exist, or you do not have access to it.</p>
      <Link href="/" className="btn btn-primary mt-8">Back to your home page</Link>
    </main>
  )
}
