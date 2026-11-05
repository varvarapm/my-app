import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  // 1. Получаем текущего пользователя
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  // 2. Удаляем его из waitlist
  const { error } = await supabase
    .from('waitlist')
    .delete()
    .eq('email', user.email)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 3. Очищаем сессию (выходим)
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
