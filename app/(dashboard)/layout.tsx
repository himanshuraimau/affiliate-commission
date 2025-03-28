import { redirect } from 'next/navigation'
import { AffiliateDashboardSidebar } from "@/components/affiliates/affiliate-dashboard-sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <AffiliateDashboardSidebar />
      <main className="flex-1 p-6 md:p-8 pt-6 md:overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
