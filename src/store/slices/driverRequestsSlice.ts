import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { driverLeaveRequestService, DriverLeaveRequest, DriverLeaveRequestFilters } from '@/services/api/driverLeaveRequests';

// Async thunk for fetch leave requests
export const fetchLeaveRequests = createAsyncThunk(
    'driverRequests/fetchLeaveRequests',
    async (filters: DriverLeaveRequestFilters = {}) => {
        const response = await driverLeaveRequestService.getLeaveRequests(filters);
        return response;
    }
);

// Async thunk for approve leave request
export const approveLeaveRequest = createAsyncThunk(
    'driverRequests/approveLeaveRequest',
    async ({ id, data }: { id: string; data: { notes?: string } }) => {
        const response = await driverLeaveRequestService.approveLeaveRequest(id, data);
        return response;
    }
);

// Async thunk for reject leave request
export const rejectLeaveRequest = createAsyncThunk(
    'driverRequests/rejectLeaveRequest',
    async ({ id, data }: { id: string; data: { rejectionReason?: string } }) => {
        const response = await driverLeaveRequestService.rejectLeaveRequest(id, data);
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
    },
    extraReducers: (builder) => {
        builder
            // Fetch leave requests
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
            // Approve leave request
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
            // Reject leave request
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
            });
    },
});

export const { setFilters, setCurrentPage, clearError, updateLeaveInList } = driverRequestsSlice.actions;
export default driverRequestsSlice.reducer;