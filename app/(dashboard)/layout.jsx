import Sidebar from '@/components/ui/Sidebar'
import TopBar from '@/components/ui/TopBar'
import SessionTimeout from '@/components/ui/SessionTimeout'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      <Sidebar />
      <div className="flex-1 ml-[270px] flex flex-col min-h-screen">
        <TopBar title="Dashboard" />
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
      <SessionTimeout />
    </div>
  )
}
