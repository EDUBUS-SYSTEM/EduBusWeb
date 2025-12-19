

export const mockParentRequests = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    parentEmail: "john.doe@email.com",
    parentInfo: {
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "0901234567",
      address: "123 Main Street, District 1, City",
      dateOfBirth: "1985-03-15T00:00:00Z",
      gender: 1,
      createdAt: "2024-01-15T08:30:00Z"
    },
    students: [
      {
        id: "student-001",
        firstName: "Jane",
        lastName: "Smith"
      },
      {
        id: "student-002", 
        firstName: "Bob",
        lastName: "Johnson"
      }
    ],
    addressText: "456 Oak Avenue, District 2, City",
    latitude: 10.762622,
    longitude: 106.660172,
    distanceKm: 5.2,
    description: "Pickup point at main school gate",
    reason: "Home is far from school, need transportation service",
    unitPriceVndPerKm: 50000,
    estimatedPriceVnd: 260000,
    status: "Pending" as const,
    adminNotes: "",
    reviewedAt: undefined,
    reviewedByAdminId: undefined,
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: undefined
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    parentEmail: "tran.thi.d@email.com",
    parentInfo: {
      firstName: "Trần",
      lastName: "Thị D",
      phoneNumber: "0907654321",
      address: "789 Đường DEF, Quận 3, TP.HCM",
      dateOfBirth: "1988-07-22T00:00:00Z",
      gender: 2,
      createdAt: "2024-01-18T14:20:00Z"
    },
    students: [
      {
        id: "student-003",
        firstName: "Trần",
        lastName: "Văn E"
      }
    ],
    addressText: "321 Đường GHI, Quận 4, TP.HCM",
    latitude: 10.740000,
    longitude: 106.650000,
    distanceKm: 3.8,
    description: "Điểm đón tại bến xe buýt",
    reason: "Công việc bận rộn, không thể đưa đón con",
    unitPriceVndPerKm: 50000,
    estimatedPriceVnd: 190000,
    status: "Approved" as const,
    adminNotes: "Đã kiểm tra địa điểm, phù hợp với tuyến đường",
    reviewedAt: "2024-01-21T10:30:00Z",
    reviewedByAdminId: "admin-001",
    createdAt: "2024-01-19T11:45:00Z",
    updatedAt: "2024-01-21T10:30:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    parentEmail: "le.van.f@email.com",
    parentInfo: {
      firstName: "Lê",
      lastName: "Văn F",
      phoneNumber: "0909876543",
      address: "654 Đường JKL, Quận 5, TP.HCM",
      dateOfBirth: "1982-11-08T00:00:00Z",
      gender: 1,
      createdAt: "2024-01-17T16:10:00Z"
    },
    students: [
      {
        id: "student-004",
        firstName: "Lê",
        lastName: "Thị G"
      },
      {
        id: "student-005",
        firstName: "Lê",
        lastName: "Văn H"
      },
      {
        id: "student-006",
        firstName: "Lê",
        lastName: "Thị I"
      }
    ],
    addressText: "987 Đường MNO, Quận 6, TP.HCM",
    latitude: 10.750000,
    longitude: 106.640000,
    distanceKm: 7.5,
    description: "Điểm đón tại chợ địa phương",
    reason: "Gia đình có 3 con, cần dịch vụ đưa đón cho tất cả",
    unitPriceVndPerKm: 50000,
    estimatedPriceVnd: 375000,
    status: "Rejected" as const,
    adminNotes: "Địa điểm quá xa, không phù hợp với tuyến đường hiện tại",
    reviewedAt: "2024-01-22T13:15:00Z",
    reviewedByAdminId: "admin-002",
    createdAt: "2024-01-18T08:20:00Z",
    updatedAt: "2024-01-22T13:15:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    parentEmail: "pham.thi.j@email.com",
    parentInfo: {
      firstName: "Phạm",
      lastName: "Thị J",
      phoneNumber: "0905555555",
      address: "147 Đường PQR, Quận 7, TP.HCM",
      dateOfBirth: "1990-05-12T00:00:00Z",
      gender: 2,
      createdAt: "2024-01-16T12:30:00Z"
    },
    students: [
      {
        id: "student-007",
        firstName: "Phạm",
        lastName: "Văn K"
      }
    ],
    addressText: "258 Đường STU, Quận 8, TP.HCM",
    latitude: 10.720000,
    longitude: 106.620000,
    distanceKm: 4.1,
    description: "Điểm đón tại trạm xe buýt",
    reason: "Mới chuyển nhà, cần dịch vụ đưa đón",
    unitPriceVndPerKm: 50000,
    estimatedPriceVnd: 205000,
    status: "Pending" as const,
    adminNotes: "",
    reviewedAt: undefined,
    reviewedByAdminId: undefined,
    createdAt: "2024-01-21T15:45:00Z",
    updatedAt: undefined
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    parentEmail: "hoang.van.l@email.com",
    parentInfo: {
      firstName: "Hoàng",
      lastName: "Văn L",
      phoneNumber: "0904444444",
      address: "369 Đường VWX, Quận 9, TP.HCM",
      dateOfBirth: "1987-09-25T00:00:00Z",
      gender: 1,
      createdAt: "2024-01-14T10:15:00Z"
    },
    students: [
      {
        id: "student-008",
        firstName: "Hoàng",
        lastName: "Thị M"
      },
      {
        id: "student-009",
        firstName: "Hoàng",
        lastName: "Văn N"
      }
    ],
    addressText: "741 Đường YZA, Quận 10, TP.HCM",
    latitude: 10.780000,
    longitude: 106.670000,
    distanceKm: 6.3,
    description: "Điểm đón tại cổng khu dân cư",
    reason: "Nhà ở khu vực mới, chưa có phương tiện công cộng",
    unitPriceVndPerKm: 50000,
    estimatedPriceVnd: 315000,
    status: "Approved" as const,
    adminNotes: "Đã khảo sát tuyến đường, có thể mở rộng dịch vụ",
    reviewedAt: "2024-01-20T16:20:00Z",
    reviewedByAdminId: "admin-001",
    createdAt: "2024-01-17T13:30:00Z",
    updatedAt: "2024-01-20T16:20:00Z"
  }
];

export const simulateApiDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockApiService = {
  get: async (url: string, params?: Record<string, unknown>) => {
    await simulateApiDelay(500);
    
    if (url.includes('/pickup-point/requests')) {
      let filteredData = [...mockParentRequests];
      
      if (params?.status) {
        filteredData = filteredData.filter(req => req.status === params.status);
      }
      
      if (params?.parentEmail) {
        filteredData = filteredData.filter(req => 
          req.parentEmail.toLowerCase().includes((params.parentEmail as string).toLowerCase())
        );
      }
      
      const skip = (params?.skip as number) || 0;
      const take = (params?.take as number) || 10;
      const paginatedData = filteredData.slice(skip, skip + take);
      
      return paginatedData;
    }
    
    return [];
  },
  
  post: async (url: string, data?: Record<string, unknown>) => {
    await simulateApiDelay(800);
    
    if (url.includes('/approve')) {
      console.log('Approving request:', data);
      return { success: true, message: 'Request approved successfully' };
    }
    
    if (url.includes('/reject')) {
      console.log('Rejecting request:', data);
      return { success: true, message: 'Request rejected successfully' };
    }
    
    return { success: true };
  }
};
