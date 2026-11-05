import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && user.email) {
    // Удаляем из базы
    await supabase.from('waitlist').delete().eq('email', user.email)
    // Выходим
    await supabase.auth.signOut()
  }

  // Перекидываем на главную
  redirect('/')
}