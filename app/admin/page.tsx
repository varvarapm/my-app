import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in — go to home
  if (!user) {
    redirect('/')
  }

  // Only this email can see the admin page
  const ADMIN_EMAIL = 'varvara.birjulina@startschool.org'
  
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-red-600">Not allowed</h1>
        <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
      </main>
    )
  }

  // Fetch all waitlist entries
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin View — Waitlist</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {waitlist?.map((row, index) => (
              <tr key={row.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{row.email}</td>
                <td className="border p-2">{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-gray-500">Total: {waitlist?.length || 0} people</p>
    </main>
  )
}