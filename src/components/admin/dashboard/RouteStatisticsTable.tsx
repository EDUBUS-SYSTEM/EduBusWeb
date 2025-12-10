import React from 'react';
import { RouteStatisticsDto } from '@/services/dashboardService';
import Card from '@/components/ui/Card';
import { FaBus, FaUsers } from 'react-icons/fa';

interface RouteStatisticsTableProps {
    data: RouteStatisticsDto[];
    loading?: boolean;
}

const RouteStatisticsTable: React.FC<RouteStatisticsTableProps> = ({ data, loading }) => {
    if (loading) {
        return (
            <Card title="Route Performance" className="w-full">
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card title="Route Performance" className="w-full">
                <div className="text-center py-8 text-gray-500">No route data available for the selected period.</div>
            </Card>
        );
    }

    return (
        <Card title="Route Performance" className="w-full overflow-hidden" padding="sm" shadow="sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route Name</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trips</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicles</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Runtime</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((route) => (
                            <tr key={route.routeId} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-4">
                                    <span className="font-medium text-gray-800">{route.routeName}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded-md text-xs font-bold">
                                        {route.totalTrips}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center text-gray-600">
                                    <div className="flex items-center justify-center space-x-1">
                                        <FaBus className="text-gray-400 text-xs" />
                                        <span>{route.activeVehicles}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center text-gray-600">
                                    <div className="flex items-center justify-center space-x-1">
                                        <FaUsers className="text-gray-400 text-xs" />
                                        <span>{route.totalStudents}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center text-gray-600">
                                    {route.averageRuntime}h
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                            <div
                                                className={`h-full rounded-full ${route.attendanceRate >= 90 ? 'bg-green-500' :
                                                        route.attendanceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${route.attendanceRate}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">{route.attendanceRate}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default RouteStatisticsTable;
