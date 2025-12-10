import React from 'react';
import { VehicleRuntimeDto } from '@/services/dashboardService';
import Card from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaClock, FaRoute } from 'react-icons/fa';

interface VehicleRuntimeCardProps {
    data: VehicleRuntimeDto;
    loading?: boolean;
}

const VehicleRuntimeCard: React.FC<VehicleRuntimeCardProps> = ({ data, loading }) => {
    if (loading) return <Card title="Vehicle Runtime" className="h-full min-h-[400px] animate-pulse"><div className="h-full bg-gray-100 rounded-xl" /></Card>;

    if (!data) return <Card title="Vehicle Runtime" className="h-full"><div>No data available</div></Card>;

    // Sort top vehicles by hours descending just in case
    const chartData = [...(data.topVehicles || [])].sort((a, b) => b.totalHours - a.totalHours).slice(0, 5);

    return (
        <Card title="Vehicle Runtime" className="h-full flex flex-col" shadow="sm">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <FaClock />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Hours Today</p>
                        <p className="text-lg font-bold text-gray-800">{data.totalHoursToday}h</p>
                    </div>
                </div>
                <div className="bg-green-50 p-3 rounded-xl flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <FaRoute />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Trips</p>
                        <p className="text-lg font-bold text-gray-800">{data.totalTripsToday}</p>
                    </div>
                </div>
            </div>

            <h4 className="text-sm font-semibold text-gray-600 mb-2">Top 5 Vehicles by Runtime</h4>
            <div className="flex-grow min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="licensePlate"
                            type="category"
                            width={80}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="totalHours" fill="#EAB308" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`rgba(234, 179, 8, ${1 - index * 0.15})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default VehicleRuntimeCard;
