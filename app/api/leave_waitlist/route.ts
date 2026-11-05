import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  // Удаляем пользователя из таблицы
  const { error } = await supabase
    .from('waitlist')
    .delete()
    .eq('email', user.email)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Выходим из системы
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}