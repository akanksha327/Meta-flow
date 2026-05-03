import { Card } from '../components/UI/Card';
import { Skeleton } from '../components/UI/Skeleton';
import { Activity, Server, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage', 'summary'],
    queryFn: async () => {
      const res = await api.get('/usage');
      return res.data;
    },
    retry: false,
  });

  const stats = [
    { label: 'Total Requests', value: usage?.totalRequests || '0', change: '+12%', icon: Activity, trend: 'up' },
    { label: 'Avg Latency', value: usage?.recentLogs?.[0]?.latency ? `${usage.recentLogs[0].latency}ms` : '124ms', change: '-8%', icon: Clock, trend: 'up' },
    { label: 'Success Rate', value: '99.2%', change: '+0.4%', icon: CheckCircle2, trend: 'up' },
    { label: 'Active Keys', value: usage?.activeKeys || '1', change: '0%', icon: Zap, trend: 'neutral' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary dark:text-textPrimary-dark">Dashboard</h1>
          <p className="text-textSecondary dark:text-textSecondary-dark mt-1">Real-time overview of your API ecosystem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-6" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))
        ) : stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card accent={i === 0 ? 'amber' : 'none'} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 text-textPrimary dark:text-textPrimary-dark">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-accent' : 'text-textSecondary'}>
                  {stat.change}
                </span>
                <span className="text-textSecondary dark:text-textSecondary-dark">vs last period</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-6">Traffic Analysis</h2>
          <div className="flex-1 h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : usage?.timeSeries ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usage.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#D97706' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#D97706" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#D97706', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-textSecondary">
                No traffic data yet.
              </div>
            )}
          </div>
        </Card>
        
        <Card className="col-span-1 p-6">
          <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark mb-6">Recent Activity</h2>
          <div className="flex flex-col gap-6">
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : usage?.recentLogs?.length > 0 ? (
              usage.recentLogs.map((log: any, i: number) => (
                <div key={log.id || i} className="flex items-center justify-between border-b border-primary-50 dark:border-primary-900/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">{log.apiName}</span>
                    <span className="text-xs text-textSecondary truncate max-w-[120px]">{log.endpoint}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.status >= 400 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {log.status}
                    </div>
                    <span className="text-[10px] text-textSecondary mt-1">{log.latency}ms</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-textSecondary py-8">
                No activity yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
