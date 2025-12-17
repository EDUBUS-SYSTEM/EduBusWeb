import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { driverLeaveRequestService, DriverLeaveRequest, DriverLeaveRequestFilters } from '@/services/api/driverLeaveRequests';
import { tripIncidentService, TripIncidentListItem, TripIncidentFilters, TripIncidentStatus } from '@/services/api/tripIncidents';

export const fetchLeaveRequests = createAsyncThunk(
    'driverRequests/fetchLeaveRequests',
    async (filters: DriverLeaveRequestFilters = {}) => {
        const response = await driverLeaveRequestService.getLeaveRequests(filters);
        return response;
    }
);

export const approveLeaveRequest = createAsyncThunk(
    'driverRequests/approveLeaveRequest',
    async ({ id, data }: { id: string; data: { notes?: string } }) => {
        const response = await driverLeaveRequestService.approveLeaveRequest(id, data);
        return response;
    }
);

export const rejectLeaveRequest = createAsyncThunk(
    'driverRequests/rejectLeaveRequest',
    async ({ id, data }: { id: string; data: { rejectionReason?: string } }) => {
        const response = await driverLeaveRequestService.rejectLeaveRequest(id, data);
        return response;
    }
);

export const fetchIncidentReports = createAsyncThunk(
    'driverRequests/fetchIncidentReports',
    async (filters: TripIncidentFilters = {}) => {
        const response = await tripIncidentService.getAll(filters);
        return response;
    }
);

interface DriverRequestsState {
    leaves: DriverLeaveRequest[];
    pendingLeavesCount: number;
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalItems: number;
        totalPages: number;
    };
    filters: DriverLeaveRequestFilters;
    incidents: TripIncidentListItem[];
    incidentsLoading: boolean;
    incidentsError: string | null;
    incidentsPagination: {
        currentPage: number;
        totalItems: number;
        totalPages: number;
    };
    openIncidentsCount: number;
    allIncidents: TripIncidentListItem[];
}

const initialState: DriverRequestsState = {
    leaves: [],
    pendingLeavesCount: 0,
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalItems: 0,
        totalPages: 0,
    },
    filters: {},
    incidents: [],
    incidentsLoading: false,
    incidentsError: null,
    incidentsPagination: {
        currentPage: 1,
        totalItems: 0,
        totalPages: 0,
    },
    openIncidentsCount: 0,
    allIncidents: [],
};

const driverRequestsSlice = createSlice({
    name: 'driverRequests',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<DriverLeaveRequestFilters>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.pagination.currentPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        updateLeaveInList: (state, action: PayloadAction<DriverLeaveRequest>) => {
            const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
            
            if (index !== -1) {
              const oldStatus = state.leaves[index].status;
              const newStatus = action.payload.status;
              
              state.leaves[index] = action.payload;
              if (oldStatus === 1 && (newStatus === 2 || newStatus === 3 || newStatus === 4)) {
                state.pendingLeavesCount = Math.max(0, state.pendingLeavesCount - 1);
              }
              else if ((oldStatus === 2 || oldStatus === 3 || oldStatus === 4) && newStatus === 1) {
                state.pendingLeavesCount += 1;
              }
            }
          },
        setIncidentsCurrentPage: (state, action: PayloadAction<number>) => {
            state.incidentsPagination.currentPage = action.payload;
        },
        addIncidentToList: (state, action: PayloadAction<TripIncidentListItem>) => {
            const existingIndex = state.allIncidents.findIndex(inc => inc.id === action.payload.id);
            if (existingIndex === -1) {
                state.allIncidents.unshift(action.payload);
                const getStatusString = (status: TripIncidentStatus | string | number): string => {
                    if (typeof status === 'string') return status;
                    if (typeof status === 'number') {
                        const statusMap: Record<number, string> = { 0: 'Open', 1: 'Acknowledged', 2: 'Resolved' };
                        return statusMap[status] || String(status);
                    }
                    return String(status);
                };
                if (getStatusString(action.payload.status) === TripIncidentStatus.Open) {
                    state.openIncidentsCount += 1;
                }
            }
        },
        updateIncidentInList: (state, action: PayloadAction<TripIncidentListItem>) => {
            const getStatusString = (status: TripIncidentStatus | string | number): string => {
                if (typeof status === 'string') return status;
                if (typeof status === 'number') {
                    const statusMap: Record<number, string> = { 0: 'Open', 1: 'Acknowledged', 2: 'Resolved' };
                    return statusMap[status] || String(status);
                }
                return String(status);
            };
            const index = state.allIncidents.findIndex(inc => inc.id === action.payload.id);
            if (index !== -1) {
                const oldStatus = getStatusString(state.allIncidents[index].status);
                const newStatus = getStatusString(action.payload.status);
                state.allIncidents[index] = action.payload;
                
                if (oldStatus === TripIncidentStatus.Open && newStatus !== TripIncidentStatus.Open) {
                    state.openIncidentsCount = Math.max(0, state.openIncidentsCount - 1);
                } else if (oldStatus !== TripIncidentStatus.Open && newStatus === TripIncidentStatus.Open) {
                    state.openIncidentsCount += 1;
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaveRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload.data;
                state.pendingLeavesCount = action.payload.pendingLeavesCount;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchLeaveRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch leave requests';
            })
            .addCase(approveLeaveRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveLeaveRequest.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
                if (index !== -1) {
                    state.leaves[index] = action.payload;
                }
            })
            .addCase(approveLeaveRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to approve leave request';
            })
            .addCase(rejectLeaveRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectLeaveRequest.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
                if (index !== -1) {
                    state.leaves[index] = action.payload;
                } 
            })
            .addCase(rejectLeaveRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to reject leave request';
            })
            .addCase(fetchIncidentReports.pending, (state) => {
                state.incidentsLoading = true;
                state.incidentsError = null;
            })
            .addCase(fetchIncidentReports.fulfilled, (state, action) => {
                state.incidentsLoading = false;
                const newIncidents = action.payload.data;
                const existingIds = new Set(state.allIncidents.map(inc => inc.id));
                const uniqueNewIncidents = newIncidents.filter(inc => !existingIds.has(inc.id));
                state.allIncidents = [...state.allIncidents, ...uniqueNewIncidents];
                
                const statusFilter = action.meta.arg.status;
                if (statusFilter) {
                    state.incidents = state.allIncidents.filter(inc => {
                        const getStatusString = (status: TripIncidentStatus | string | number): string => {
                            if (typeof status === 'string') return status;
                            if (typeof status === 'number') {
                                const statusMap: Record<number, string> = { 0: 'Open', 1: 'Acknowledged', 2: 'Resolved' };
                                return statusMap[status] || String(status);
                            }
                            return String(status);
                        };
                        return getStatusString(inc.status) === statusFilter;
                    });
                } else {
                    state.incidents = state.allIncidents;
                }
                
                state.incidentsPagination = {
                    currentPage: action.payload.pagination.currentPage,
                    totalItems: action.payload.pagination.totalItems,
                    totalPages: action.payload.pagination.totalPages,
                };
                
                const getStatusString = (status: TripIncidentStatus | string | number): string => {
                    if (typeof status === 'string') return status;
                    if (typeof status === 'number') {
                        const statusMap: Record<number, string> = { 0: 'Open', 1: 'Acknowledged', 2: 'Resolved' };
                        return statusMap[status] || String(status);
                    }
                    return String(status);
                };
                state.openIncidentsCount = state.allIncidents.filter(
                    inc => getStatusString(inc.status) === TripIncidentStatus.Open
                ).length;
            })
            .addCase(fetchIncidentReports.rejected, (state, action) => {
                state.incidentsLoading = false;
                state.incidentsError = action.error.message || 'Failed to fetch incident reports';
            });
    },
});

export const { 
    setFilters, 
    setCurrentPage, 
    clearError, 
    updateLeaveInList,
    setIncidentsCurrentPage,
    addIncidentToList,
    updateIncidentInList
} = driverRequestsSlice.actions;
export default driverRequestsSlice.reducer;