import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Shield, Home, Users, History, FileText, Settings, LogOut, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  const isAdmin = ['SUPER_ADMIN', 'PRADESHIK_ADMIN', 'GHATAK_ADMIN'].includes(session.role);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col transition-all duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Samaj Registry</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <SidebarItem icon={<Home className="w-5 h-5" />} label="Overview" href="/dashboard" active />
          
          {isAdmin ? (
            <>
              <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</div>
              <SidebarItem icon={<Users className="w-5 h-5" />} label="Families" href="/dashboard/families" />
              <SidebarItem icon={<Search className="w-5 h-5" />} label="Member Search" href="/dashboard/search" />
              <SidebarItem icon={<History className="w-5 h-5" />} label="Verification Queue" href="/dashboard/verifications" />
              <SidebarItem icon={<FileText className="w-5 h-5" />} label="Audit Logs" href="/dashboard/logs" />
            </>
          ) : (
            <>
              <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Registry</div>
              <SidebarItem icon={<Users className="w-5 h-5" />} label="My Family" href="/dashboard/my-family" />
              <SidebarItem icon={<History className="w-5 h-5" />} label="My Requests" href="/dashboard/requests" />
              <SidebarItem icon={<FileText className="w-5 h-5" />} label="Certificates" href="/dashboard/documents" />
            </>
          )}

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</div>
          <SidebarItem icon={<Settings className="w-5 h-5" />} label="Settings" href="/dashboard/settings" />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarFallback className="bg-blue-600/20 text-blue-500 font-bold">
                {session.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.email.split('@')[0]}</p>
              <p className="text-xs text-gray-500 truncate">{session.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">Dashboard Overview</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0a0a]"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 px-2">
                   <Settings className="w-5 h-5 mr-2" />
                   Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border-white/10 text-gray-300">
                <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">Profile Settings</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">Support</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#080808] to-[#050505]">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${active 
          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'}
      `}
    >
      <div className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
    </Link>
  );
}
