import { redirect } from 'next/navigation'
import ActionForm from '@/components/ActionForm'
import AppShell from '@/components/AppShell'
import { Avatar } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { updateMyName } from '@/actions/profile'

const ROLE_LABEL = { admin: 'Administrator', advisor: 'Advisor', client: 'Client' } as const

// Profil partagé par les trois rôles (Design Rev. 3, §6.5) : seul le nom est modifiable.
export default async function ProfilePage() {
  const me = await getCurrentUser()
  if (!me) redirect('/login')
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = typeof data?.claims?.email === 'string' ? data.claims.email : ''

  return (
    <AppShell me={me}>
      <main className="page max-w-2xl">
        <div className="flex items-center gap-4">
          <Avatar name={me.full_name} size="lg" />
          <div>
            <h1 className="page-title">Your profile</h1>
            <p className="mt-1 text-sm text-muted">{ROLE_LABEL[me.role]}</p>
          </div>
        </div>

        <section className="panel panel-hero mt-8 p-6">
          <ActionForm action={updateMyName}>
            <div className="space-y-5">
            <label className="block text-sm text-muted">
              Full name
              <input name="full_name" defaultValue={me.full_name} required maxLength={120} className="field mt-1 w-full" />
            </label>
            <label className="block text-sm text-muted">
              Email
              <input value={email} readOnly disabled className="field mt-1 w-full opacity-70" />
              <span className="mt-1 block text-xs">Managed by the sign-in service.</span>
            </label>
            <label className="block text-sm text-muted">
              Role
              <input value={ROLE_LABEL[me.role]} readOnly disabled className="field mt-1 w-full opacity-70" />
              <span className="mt-1 block text-xs">Only an administrator can change roles.</span>
            </label>
            <button className="btn btn-primary">Save name</button>
            </div>
          </ActionForm>
        </section>
      </main>
    </AppShell>
  )
}
