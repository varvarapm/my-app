'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [position, setPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data, error } = await supabase.rpc('get_waitlist_position')
        if (!error) {
          setPosition(data)
        }
      }
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleLogout = async () => {
    try {
      // 1. Выходим из Supabase (используем scope: local)
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.error("Logout error:", error)
    }

    // 2. Принудительно чистим все куки в браузере
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    // 3. Принудительно перезагружаем страницу на главную
    window.location.href = '/'
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p>Loading...</p>
      </main>
    )
  }

  if (user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold">You're on the list!</h1>
        <p className="mt-4 text-lg">Welcome, {user.user_metadata.full_name || user.email}</p>
        
        {user.user_metadata.avatar_url && (
          <img src={user.user_metadata.avatar_url} alt="Profile" className="mt-4 w-16 h-16 rounded-full" />
        )}
        
        <p className="text-gray-500">{user.email}</p>

        {position !== null && (
          <p className="mt-6 text-2xl font-semibold text-blue-600">
            You're #{position} on the list!
          </p>
        )}

        <button 
          onClick={handleLogout} 
          className="mt-8 rounded-lg bg-gray-200 px-6 py-3 text-black hover:bg-gray-300 transition-colors"
        >
          Log out
        </button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Email listing</h1>
      <p className="mt-4 text-lg text-gray-600">Still want to join?</p>
      <button 
        onClick={handleGoogleLogin} 
        className="mt-8 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 transition-colors"
      >
        Join with Google
      </button>
    </main>
  )
}