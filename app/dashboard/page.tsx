import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, FileWarning, TrendingUp, MapPin } from 'lucide-react';

export default async function DashboardOverview() {
  const session = await getAuthSession();
  
  // Real stats from DB (in a real app)
  const familyCount = await prisma.family.count();
  const memberCount = await prisma.member.count();
  const pendingRequests = await prisma.correctionRequest.count({ where: { status: 'PENDING' } });
  const verifiedFamilies = await prisma.family.count({ where: { isVerified: true } });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Registry Insights</h2>
        <p className="text-gray-400">Real-time statistics for the community census database.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Families" 
          value={familyCount.toString()} 
          icon={<Users className="w-5 h-5 text-blue-500" />} 
          description="+12 this month"
          trend="+4.2%"
        />
        <StatCard 
          title="Total Members" 
          value={memberCount.toString()} 
          icon={<UserCheck className="w-5 h-5 text-emerald-500" />} 
          description="Census live data"
          trend="+1.5%"
        />
        <StatCard 
          title="Pending Approvals" 
          value={pendingRequests.toString()} 
          icon={<Clock className="w-5 h-5 text-amber-500" />} 
          description="Awaiting verification"
          trend="Action required"
          highlight={pendingRequests > 0}
        />
        <StatCard 
          title="Verified Status" 
          value={`${Math.round((verifiedFamilies / (familyCount || 1)) * 100)}%`} 
          icon={<TrendingUp className="w-5 h-5 text-indigo-500" />} 
          description="Database integrity"
          trend="Stable"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity Card */}
        <Card className="bg-[#0a0a0a] border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Recent Corrections</CardTitle>
            <Clock className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ActivityItem 
                title="Member Addition" 
                user="Rajesh Kumar" 
                time="2 hours ago" 
                status="PENDING" 
              />
              <ActivityItem 
                title="Address Update" 
                user="Suresh Patel" 
                time="5 hours ago" 
                status="APPROVED" 
              />
              <ActivityItem 
                title="Transfer Request" 
                user="Amit Shah" 
                time="1 day ago" 
                status="REJECTED" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution Mock */}
        <Card className="bg-[#0a0a0a] border-white/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Regional Distribution</CardTitle>
            <MapPin className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <RegionBar label="Mumbai North" percentage={45} color="bg-blue-600" />
                <RegionBar label="Gujarat Central" percentage={30} color="bg-emerald-600" />
                <RegionBar label="Pune Regional" percentage={15} color="bg-amber-600" />
                <RegionBar label="Others" percentage={10} color="bg-indigo-600" />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description, trend, highlight = false }: any) {
  return (
    <Card className={`bg-[#0a0a0a] border-white/5 shadow-xl transition-all hover:border-white/10 ${highlight ? 'ring-1 ring-amber-500/20' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs ${trend.includes('+') ? 'text-emerald-500' : 'text-amber-500'}`}>{trend}</span>
          <span className="text-xs text-gray-600 font-normal">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, user, time, status }: any) {
  const statusColors: any = {
    PENDING: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    APPROVED: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    REJECTED: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-gray-500">by {user} • {time}</p>
      </div>
      <div className={`px-2 py-1 rounded-md text-[10px] font-bold border ${statusColors[status]}`}>
        {status}
      </div>
    </div>
  );
}

function RegionBar({ label, percentage, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
