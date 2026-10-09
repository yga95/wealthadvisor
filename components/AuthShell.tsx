// Mise en page des écrans de connexion et d'inscription.
export default function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen flex-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-pine p-12 text-white md:flex">
        <p className="font-display text-2xl">WealthAdvisor</p>
        <div className="max-w-sm">
          <p className="font-display text-4xl leading-tight">
            Every client file, asset and recommendation in one place.
          </p>
          <div className="mt-8 flex h-2 w-48 overflow-hidden rounded-sm" aria-hidden>
            <div className="w-[55%] bg-white" />
            <div className="w-[30%] bg-brass" />
            <div className="w-[15%] bg-white/30" />
          </div>
        </div>
        <p className="text-sm text-white/60">For advisory firms, their advisors and their clients.</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <p className="mb-10 font-display text-2xl text-pine md:hidden">WealthAdvisor</p>
          <h1 className="page-title">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  )
}
