import { Logo } from '@/components/AppShell'
import { Ring } from '@/components/AllocationRing'

// Mise en page des écrans de connexion et d'inscription.
export default function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 md:flex">
        <Logo />
        <div>
          <div className="relative w-fit">
            <div className="absolute inset-8 rounded-full bg-champagne/10 blur-3xl" aria-hidden />
            <Ring actions={55} obligations={30} liquidites={15} center="55%" caption="in equities" size={300} />
          </div>
          <h2 className="mt-10 max-w-lg font-display text-[2rem] font-medium leading-tight tracking-tight">
            Every client file, asset and recommendation in one place.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Advisors keep each file up to date, AI drafts the allocation, and clients follow it from their own portal.
          </p>
        </div>
        <p className="text-sm text-muted">For advisory firms, their advisors and their clients.</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="panel panel-hero w-full max-w-sm p-8">
          <div className="mb-8 md:hidden"><Logo /></div>
          <h1 className="page-title text-[1.6rem]">{title}</h1>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  )
}
