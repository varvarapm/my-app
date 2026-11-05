import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const refCode = searchParams.get('ref') // Получаем код пригласившего из URL

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.email) {
        let referrerId = null

        // Если есть реферальный код, ищем, кому он принадлежит
        if (refCode) {
          const { data: referrer } = await supabase
            .from('waitlist')
            .select('id')
            .eq('referral_code', refCode)
            .single()
          
          if (referrer) referrerId = referrer.id
        }

        // Сохраняем пользователя (создаем реферальный код, если его нет)
        const { data: existingUser } = await supabase
          .from('waitlist')
          .select('id')
          .eq('email', user.email)
          .single()

        if (!existingUser) {
          await supabase.from('waitlist').insert({
            email: user.email,
            full_name: user.user_metadata.full_name || user.user_metadata.name,
            avatar_url: user.user_metadata.avatar_url,
            referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(), // Генерируем код
            referred_by: referrerId
          })
        }
      }
      return NextResponse.redirect(`${origin}/`)
    }
  }
  return NextResponse.redirect(`${origin}/auth/error`)
}