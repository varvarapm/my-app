'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [position, setPosition] = useState<number | null>(null)

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
    }
    getUser()
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
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

        <button onClick={handleLogout} className="mt-8 rounded-lg bg-gray-200 px-6 py-3 text-black">
          Log out
        </button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Email listing</h1>
      <p className="mt-4 text-lg text-gray-600">Still want to join?</p>
      <button onClick={handleGoogleLogin} className="mt-8 rounded-lg bg-black px-6 py-3 text-white">
        Join with Google
      </button>
    </main>
  )
}