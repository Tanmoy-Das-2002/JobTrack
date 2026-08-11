import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface AnalyticsViewProps {
  applications: any[];
  stats: any;
}

const STATUS_COLORS: Record<string, string> = {
  Wishlist: '#f59e0b',
  Applied: '#3b82f6',
  'Online Assessment': '#a855f7',
  Interview: '#f97316',
  Offer: '#10b981',
  Rejected: '#f43f5e',
  Withdrawn: '#64748b',
};

export default function AnalyticsView({ applications, stats }: AnalyticsViewProps) {
  // 1. Calculate Status Distribution Data
  const statusCounts: Record<string, number> = {};
  applications.forEach((app) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  const statusPieData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
    color: STATUS_COLORS[status] || '#94a3b8',
  }));

  // 2. Calculate Work Mode Data
  const modeCounts: Record<string, number> = { 'On-site': 0, Hybrid: 0, Remote: 0 };
  applications.forEach((app) => {
    if (app.workMode) {
      modeCounts[app.workMode] = (modeCounts[app.workMode] || 0) + 1;
    }
  });

  const modeData = Object.keys(modeCounts).map((mode) => ({
    mode,
    count: modeCounts[mode],
  }));

  // 3. Application Pipeline Funnel Steps
  const total = applications.length;
  const appliedCount = statusCounts['Applied'] || 0;
  const oaCount = statusCounts['Online Assessment'] || 0;
  const interviewCount = (statusCounts['Interview'] || 0) + applications.filter(a => a.interviews?.length > 0).length;
  const offerCount = statusCounts['Offer'] || 0;

  const funnelData = [
    { stage: 'Total Logged', count: total },
    { stage: 'Applied', count: appliedCount + oaCount + interviewCount + offerCount },
    { stage: 'OA / Screen', count: oaCount + interviewCount + offerCount },
    { stage: 'Interviews', count: interviewCount + offerCount },
    { stage: 'Offers', count: offerCount },
  ];

  // Key Ratios
  const interviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0;
  const activePipeline = total - (statusCounts['Rejected'] || 0) - (statusCounts['Withdrawn'] || 0);

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Interview Rate</span>
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{interviewRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Applications leading to interview rounds</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Offer Conversion Rate</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{offerRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{offerCount} total job offers received</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Pipeline</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 mt-2">{activePipeline}</div>
          <p className="text-[11px] text-slate-400 mt-1">Non-rejected & non-withdrawn applications</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Interviews</span>
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {applications.reduce((acc, a) => acc + (a.interviews?.length || 0), 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Individual interview rounds logged</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Distribution Pie Chart */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <PieChartIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Application Status Breakdown</h3>
          </div>

          {statusPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              No application data available for chart visualization.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recruitment Pipeline Funnel Bar Chart */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Recruitment Funnel Progress</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Work Mode Breakdown & Application Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modeData.map((m) => (
          <div key={m.mode} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">{m.mode} Roles</span>
              <div className="text-xl font-bold text-white mt-1">{m.count}</div>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
              {total > 0 ? Math.round((m.count / total) * 100) : 0}% of total
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
