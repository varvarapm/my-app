'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [position, setPosition] = useState<number | null>(null)
  const [referrals, setReferrals] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Получаем позицию
        const { data: posData } = await supabase.rpc('get_waitlist_position')
        if (posData) setPosition(posData)

        // Получаем данные текущего пользователя (чтобы узнать его referral_code и id)
        const { data: currentUser } = await supabase
          .from('waitlist')
          .select('id, referral_code')
          .eq('email', user.email)
          .single()

        if (currentUser) {
          // Считаем, сколько людей он пригласил
          const { count } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', currentUser.id)
          
          setReferrals(count || 0)
          // Сохраняем код в стейт, чтобы показать ссылку
          user.referralCode = currentUser.referral_code 
        }
      }
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' })
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    window.location.href = '/'
  }

  if (loading) return <main className="p-8 text-center">Loading...</main>

  if (user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold">You're on the list!</h1>
        <p className="mt-4 text-lg">Welcome, {user.user_metadata.full_name || user.email}</p>
        {user.user_metadata.avatar_url && <img src={user.user_metadata.avatar_url} alt="Profile" className="mt-4 w-16 h-16 rounded-full" />}
        <p className="text-gray-500">{user.email}</p>

        {position && <p className="mt-6 text-2xl font-semibold text-blue-600">You're #{position} on the list!</p>}

        {/* Блок рефералов */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-blue-900">Invite friends to move up</h2>
          <p className="mt-2 text-sm text-blue-700">Share this link:</p>
          <input 
            type="text" 
            readOnly 
            value={`${window.location.origin}/?ref=${user.referralCode || ''}`} 
            className="mt-2 w-full p-2 border rounded bg-white text-sm text-gray-600 text-center"
          />
          <p className="mt-4 font-semibold text-blue-800">
            You invited {referrals} {referrals === 1 ? 'person' : 'people'}
          </p>
        </div>

        <button onClick={handleLogout} className="mt-8 rounded-lg bg-gray-200 px-6 py-3 text-black hover:bg-gray-300">
          Log out
        </button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Email listing</h1>
      <p className="mt-4 text-lg text-gray-600">Still want to join?</p>
      <button onClick={handleGoogleLogin} className="mt-8 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800">
        Join with Google
      </button>
    </main>
  )
}