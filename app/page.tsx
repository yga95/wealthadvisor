import { redirect } from 'next/navigation'

// Le proxy redirige déjà « / » vers la page du rôle ; ceci est un filet de sécurité.
export default function Home() {
  redirect('/login')
}
