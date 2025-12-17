import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaCalendarAlt, FaClock, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { RouteDto } from '@/services/routeService/routeService.types';
import { Schedule } from '@/types';
import { RouteScheduleDto, CreateRouteScheduleDto } from '@/services/routeScheduleService/routeSchedule.type';
import { scheduleService } from '@/services/api/scheduleService';
import { routeScheduleService } from '@/services/routeScheduleService/routeSchedule.api';
import { formatDate, formatDateTime } from '@/utils/dateUtils';

interface RouteScheduleModalProps {
  route: RouteDto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RouteScheduleModal({ route, onClose, onSuccess }: RouteScheduleModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routeSchedules, setRouteSchedules] = useState<RouteScheduleDto[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [effectiveTo, setEffectiveTo] = useState<string>('');
  const [priority, setPriority] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
    const today = new Date();
    today.setHours(today.getHours() + 1);
    setEffectiveFrom(today.toISOString().slice(0, 16));
  }, [route.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const schedulesData = await scheduleService.getSchedules({ activeOnly: true });
      setSchedules(schedulesData);

      const routeSchedulesData = await routeScheduleService.getByRoute(route.id);
      setRouteSchedules(routeSchedulesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!selectedScheduleId) {
      errors.scheduleId = 'Please select a schedule';
    }

    if (!effectiveFrom) {
      errors.effectiveFrom = 'Effective from date is required';
    } else {
      const fromDate = new Date(effectiveFrom);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (fromDate < oneHourFromNow) {
        errors.effectiveFrom = 'Effective from must be at least 1 hour from now';
      }
    }

    if (effectiveTo) {
      const fromDate = new Date(effectiveFrom);
      const toDate = new Date(effectiveTo);

      if (toDate <= fromDate) {
        errors.effectiveTo = 'Effective to must be greater than effective from';
      }
    }

    if (priority < 0) {
      errors.priority = 'Priority must be 0 or greater';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLinkSchedule = async () => {
    if (!validateForm()) {
      return;
    }

    const alreadyLinked = routeSchedules.some(rs => rs.scheduleId === selectedScheduleId);
    if (alreadyLinked) {
      setError('This schedule is already linked to this route');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const createDto: CreateRouteScheduleDto = {
        routeId: route.id,
        scheduleId: selectedScheduleId,
        effectiveFrom: new Date(effectiveFrom).toISOString(),
        effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
        priority: priority,
        isActive: true
      };

      await routeScheduleService.create(createDto);

      await loadData();

      setSelectedScheduleId('');
      setEffectiveFrom('');
      setEffectiveTo('');
      setPriority(0);
      setFormErrors({});
      onSuccess();
    } catch (error: unknown) {
      console.error('Error linking schedule:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
        };

        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('Failed to link schedule. Please try again.');
        }
      } else {
        setError('Failed to link schedule. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkSchedule = async (routeScheduleId: string) => {
    if (!confirm('Are you sure you want to unlink this schedule from the route?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await routeScheduleService.delete(routeScheduleId);

      await loadData();
      onSuccess();
    } catch (error: unknown) {
      console.error('Error unlinking schedule:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
        };

        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('Failed to unlink schedule. Please try again.');
        }
      } else {
        setError('Failed to unlink schedule. Please try again.');
      }

    } finally {
      setLoading(false);
    }
  };

  const getScheduleDetails = (scheduleId: string) => {
    return schedules.find(s => s.id === scheduleId);
  };

  const availableSchedules = schedules.filter(schedule =>
    !routeSchedules.some(rs => rs.scheduleId === schedule.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Manage Schedules for {route.routeName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Vehicle: {route.vehicleNumberPlate} | Capacity: {route.vehicleCapacity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={() => setError('')}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
              >
                <FaTimes size={14} />
              </button>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaPlus className="text-green-600" />
              Link New Schedule
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Schedule *
                  </label>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => {
                      setSelectedScheduleId(e.target.value);
                      if (formErrors.scheduleId) {
                        setFormErrors(prev => ({ ...prev, scheduleId: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.scheduleId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    disabled={loading || availableSchedules.length === 0}
                  >
                    <option value="">
                      {availableSchedules.length === 0
                        ? 'No available schedules'
                        : 'Choose a schedule...'
                      }
                    </option>
                    {availableSchedules.map(schedule => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.name} ({schedule.scheduleType}) - {schedule.startTime} to {schedule.endTime}
                      </option>
                    ))}
                  </select>
                  {formErrors.scheduleId && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.scheduleId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={priority}
                    onChange={(e) => {
                      setPriority(parseInt(e.target.value) || 0);
                      if (formErrors.priority) {
                        setFormErrors(prev => ({ ...prev, priority: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.priority ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="0"
                  />
                  {formErrors.priority && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.priority}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <FaInfoCircle className="text-blue-500" />
                    Higher priority schedules take precedence when multiple schedules overlap
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective From *
                  </label>
                  <input
                    type="datetime-local"
                    value={effectiveFrom}
                    onChange={(e) => {
                      setEffectiveFrom(e.target.value);
                      if (formErrors.effectiveFrom) {
                        setFormErrors(prev => ({ ...prev, effectiveFrom: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.effectiveFrom ? 'border-red-300' : 'border-gray-300'
                      }`}
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                  />
                  {formErrors.effectiveFrom && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.effectiveFrom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective To (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={effectiveTo}
                    onChange={(e) => {
                      setEffectiveTo(e.target.value);
                      if (formErrors.effectiveTo) {
                        setFormErrors(prev => ({ ...prev, effectiveTo: '' }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.effectiveTo ? 'border-red-300' : 'border-gray-300'
                      }`}
                    min={effectiveFrom || new Date().toISOString().slice(0, 16)}
                  />
                  {formErrors.effectiveTo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.effectiveTo}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleLinkSchedule}
                disabled={loading || !selectedScheduleId || availableSchedules.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPlus />
                )}
                Link Schedule
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              Linked Schedules ({routeSchedules.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : routeSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaCalendarAlt size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No schedules linked to this route yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {routeSchedules.map(routeSchedule => {
                  const schedule = getScheduleDetails(routeSchedule.scheduleId);
                  return (
                    <div
                      key={routeSchedule.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {schedule?.name || 'Unknown Schedule'}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${routeSchedule.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {routeSchedule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {schedule && (
                            <div className="text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <FaClock className="text-gray-400" />
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {schedule.scheduleType}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-right text-xs text-gray-500 ml-4 flex-shrink-0">
                          <div className="space-y-1">
                            <div>Effective: {formatDateTime(routeSchedule.effectiveFrom)}</div>
                            {routeSchedule.effectiveTo && (
                              <div>Until: {formatDateTime(routeSchedule.effectiveTo)}</div>
                            )}
                            <div className="font-medium">Priority: {routeSchedule.priority}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleUnlinkSchedule(routeSchedule.id)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Unlink schedule"
                        >
                          <FaTrash size={14} />
                          <span className="text-xs">Unlink</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}