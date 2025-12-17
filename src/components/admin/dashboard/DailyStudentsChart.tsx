import React from 'react';
import { DailyStudentsDto } from '@/services/dashboardService';
import Card from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyStudentsChartProps {
    data: DailyStudentsDto;
    loading?: boolean;
}

const DailyStudentsChart: React.FC<DailyStudentsChartProps> = ({ data, loading }) => {
    if (loading) {
        return <Card title="Daily Students" className="h-[400px] animate-pulse"><div className="h-full bg-gray-100 rounded-xl" /></Card>;
    }

    const chartData = data?.last7Days?.map(d => ({
        date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count: d.count
    })) || [];

    return (
        <Card title="Daily Students" className="h-full" shadow="sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
                <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4 content-center">
                    <StatBox label="Today" value={data?.today || 0} color="text-yellow-600" />
                    <StatBox label="Yesterday" value={data?.yesterday || 0} color="text-gray-500" />
                    <StatBox label="This Week (Avg)" value={data?.thisWeek || 0} color="text-blue-600" />
                    <StatBox label="This Month (Avg)" value={data?.thisMonth || 0} color="text-purple-600" />
                </div>

                <div className="lg:col-span-2 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#EAB308', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#D97706" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

const StatBox = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
        <span className="text-sm text-gray-500 mb-1">{label}</span>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
);

export default DailyStudentsChart;
