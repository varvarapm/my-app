import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && user.email) {
    await supabase.from('waitlist').delete().eq('email', user.email)
    await supabase.auth.signOut()
  }

  redirect('/')
}