import React from 'react';
import { AttendanceRateDto } from '@/services/dashboardService';
import Card from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AttendanceRateCardProps {
    data: AttendanceRateDto;
    loading?: boolean;
    period: 'today' | 'week' | 'month';
    onPeriodChange: (period: 'today' | 'week' | 'month') => void;
}

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#9ca3af']; 

const AttendanceRateCard: React.FC<AttendanceRateCardProps> = ({ data, loading, period, onPeriodChange }) => {
    if (loading) return <Card title="Attendance Rate" className="h-full min-h-[400px] animate-pulse"><div className="h-full bg-gray-100 rounded-xl" /></Card>;


    if (!data) return <Card title="Attendance Rate" className="h-full min-h-[400px]"><div>No data available</div></Card>;

    const chartData = [
        { name: 'Present', value: data.totalPresent },
        { name: 'Absent', value: data.totalAbsent },
        { name: 'Late', value: data.totalLate },
        { name: 'Excused', value: data.totalExcused },
        { name: 'Pending', value: data.totalPending },
    ].filter(item => item.value > 0);

    const rate = period === 'today' ? data.todayRate : period === 'week' ? data.weekRate : data.monthRate;

    return (
        <Card title="Attendance Rate" className="h-full flex flex-col" shadow="sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {(['today', 'week', 'month'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange(p)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${period === p ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-500 block">Overall Rate</span>
                    <span className="text-xl font-bold text-yellow-600">{rate}%</span>
                </div>
            </div>

            <div className="flex-grow min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', padding: '8px' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                    <span className="text-gray-400 text-xs text-nowrap block">Total</span>
                    <span className="text-xl font-bold text-gray-700">{data.totalStudents}</span>
                </div>
            </div>
        </Card>
    );
};

export default AttendanceRateCard;
