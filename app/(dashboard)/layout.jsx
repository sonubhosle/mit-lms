import Sidebar from '@/components/ui/Sidebar'
import TopBar from '@/components/ui/TopBar'
import SessionTimeout from '@/components/ui/SessionTimeout'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <TopBar title="Dashboard" />
        <main className="p-8 flex-1 animate-fade-in">
          {children}
        </main>
      </div>
      <SessionTimeout />
    </div>
  )
}
