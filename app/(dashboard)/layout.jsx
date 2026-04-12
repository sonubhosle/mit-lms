import Sidebar from '@/components/ui/Sidebar'
import TopBar from '@/components/ui/TopBar'
import SessionTimeout from '@/components/ui/SessionTimeout'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Background Decorators for premium feel */}
      <div className="fixed top-0 left-0 w-full h-96 bg-linear-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
      
      <Sidebar />
      <div className="flex-1 ml-[300px] flex flex-col min-h-screen">
        <TopBar title="Dashboard" />
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
      <SessionTimeout />
    </div>
  )
}
