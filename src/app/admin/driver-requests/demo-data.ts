// Demo data for testing Driver Requests page
// This file contains sample data for both leave requests and general requests

import { DriverLeaveRequest } from "@/services/api/driverLeaveRequests";
import { GeneralDriverRequest } from "./GeneralRequestsTab";

// Driver Leave Requests (moved from driver-leaves)
export const mockDriverLeaves: DriverLeaveRequest[] = [
  {
    id: "leave-001",
    driverId: "driver-001",
    driverInfo: {
      firstName: "Nguyễn",
      lastName: "Văn An",
      phoneNumber: "0901234567",
      email: "nguyen.van.an@email.com",
      licenseNumber: "A123456789",
      vehicleId: "vehicle-001",
      vehicleInfo: {
        plateNumber: "51A-12345",
        model: "Toyota Hiace"
      }
    },
    leaveType: "Sick",
    startDate: "2024-01-25T00:00:00Z",
    endDate: "2024-01-27T00:00:00Z",
    reason: "Bị cảm cúm, sốt cao, cần nghỉ để điều trị và phục hồi sức khỏe. Đã có giấy xác nhận của bác sĩ.",
    status: "Pending",
    submittedAt: "2024-01-24T14:30:00Z",
    attachments: [
      {
        id: "att-001",
        fileName: "medical_certificate.pdf",
        fileUrl: "/documents/medical_certificate.pdf",
        fileType: "PDF"
      }
    ]
  },
  {
    id: "leave-002",
    driverId: "driver-002",
    driverInfo: {
      firstName: "Trần",
      lastName: "Thị Bình",
      phoneNumber: "0907654321",
      email: "tran.thi.binh@email.com",
      licenseNumber: "B987654321",
      vehicleId: "vehicle-002",
      vehicleInfo: {
        plateNumber: "51B-67890",
        model: "Ford Transit"
      }
    },
    leaveType: "Personal",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2024-02-03T00:00:00Z",
    reason: "Có việc gia đình quan trọng, cần về quê để giải quyết các vấn đề cá nhân.",
    status: "Approved",
    submittedAt: "2024-01-30T09:15:00Z",
    reviewedAt: "2024-01-31T10:30:00Z",
    reviewedByAdminId: "admin-001",
    adminNotes: "Đã xác nhận với tài xế về lý do nghỉ. Phù hợp với quy định công ty."
  },
  {
    id: "leave-003",
    driverId: "driver-003",
    driverInfo: {
      firstName: "Lê",
      lastName: "Văn Cường",
      phoneNumber: "0909876543",
      email: "le.van.cuong@email.com",
      licenseNumber: "C456789123",
      vehicleId: "vehicle-003",
      vehicleInfo: {
        plateNumber: "51C-11111",
        model: "Mercedes Sprinter"
      }
    },
    leaveType: "Emergency",
    startDate: "2024-01-20T00:00:00Z",
    endDate: "2024-01-20T00:00:00Z",
    reason: "Gia đình có việc khẩn cấp, cần nghỉ ngay trong ngày để xử lý tình huống.",
    status: "Approved",
    submittedAt: "2024-01-20T07:00:00Z",
    reviewedAt: "2024-01-20T08:15:00Z",
    reviewedByAdminId: "admin-002",
    adminNotes: "Tình huống khẩn cấp được xác nhận. Đã sắp xếp tài xế thay thế."
  },
  {
    id: "leave-004",
    driverId: "driver-004",
    driverInfo: {
      firstName: "Phạm",
      lastName: "Thị Dung",
      phoneNumber: "0905555555",
      email: "pham.thi.dung@email.com",
      licenseNumber: "D789123456",
      vehicleId: "vehicle-004",
      vehicleInfo: {
        plateNumber: "51D-22222",
        model: "Hyundai County"
      }
    },
    leaveType: "Vacation",
    startDate: "2024-02-10T00:00:00Z",
    endDate: "2024-02-16T00:00:00Z",
    reason: "Nghỉ phép năm để đi du lịch cùng gia đình. Đã đăng ký trước 2 tuần.",
    status: "Rejected",
    submittedAt: "2024-01-25T11:20:00Z",
    reviewedAt: "2024-01-26T14:45:00Z",
    reviewedByAdminId: "admin-001",
    rejectionReason: "Thời gian nghỉ quá dài trong tháng cao điểm. Vui lòng chọn thời gian khác hoặc chia nhỏ kỳ nghỉ."
  },
  {
    id: "leave-005",
    driverId: "driver-005",
    driverInfo: {
      firstName: "Hoàng",
      lastName: "Văn Em",
      phoneNumber: "0904444444",
      email: "hoang.van.em@email.com",
      licenseNumber: "E321654987",
      vehicleId: "vehicle-005",
      vehicleInfo: {
        plateNumber: "51E-33333",
        model: "Isuzu NPR"
      }
    },
    leaveType: "Sick",
    startDate: "2024-01-28T00:00:00Z",
    endDate: "2024-01-30T00:00:00Z",
    reason: "Đau lưng do tai nạn nhỏ, cần nghỉ để điều trị vật lý trị liệu.",
    status: "Pending",
    submittedAt: "2024-01-27T16:45:00Z",
    attachments: [
      {
        id: "att-002",
        fileName: "doctor_note.pdf",
        fileUrl: "/documents/doctor_note.pdf",
        fileType: "PDF"
      },
      {
        id: "att-003",
        fileName: "xray_result.jpg",
        fileUrl: "/documents/xray_result.jpg",
        fileType: "Image"
      }
    ]
  },
  {
    id: "leave-006",
    driverId: "driver-011",
    driverInfo: {
      firstName: "Vũ",
      lastName: "Văn Phong",
      phoneNumber: "0907777777",
      email: "vu.van.phong@email.com",
      licenseNumber: "K123456789",
      vehicleId: "vehicle-011",
      vehicleInfo: {
        plateNumber: "51K-99999",
        model: "Toyota Hiace"
      }
    },
    leaveType: "Sick",
    startDate: "2024-02-05T00:00:00Z",
    endDate: "2024-02-07T00:00:00Z",
    reason: "Bị đau đầu dữ dội, cần nghỉ để điều trị và nghỉ ngơi.",
    status: "Pending",
    submittedAt: "2024-02-04T16:20:00Z",
    attachments: [
      {
        id: "att-004",
        fileName: "headache_certificate.pdf",
        fileUrl: "/documents/headache_certificate.pdf",
        fileType: "PDF"
      }
    ]
  },
  {
    id: "leave-007",
    driverId: "driver-012",
    driverInfo: {
      firstName: "Đỗ",
      lastName: "Thị Lan",
      phoneNumber: "0906666666",
      email: "do.thi.lan@email.com",
      licenseNumber: "L987654321",
      vehicleId: "vehicle-012",
      vehicleInfo: {
        plateNumber: "51L-00000",
        model: "Ford Transit"
      }
    },
    leaveType: "Personal",
    startDate: "2024-02-15T00:00:00Z",
    endDate: "2024-02-17T00:00:00Z",
    reason: "Có đám cưới của em gái, cần nghỉ để tham dự và hỗ trợ gia đình.",
    status: "Approved",
    submittedAt: "2024-02-10T09:30:00Z",
    reviewedAt: "2024-02-11T10:15:00Z",
    reviewedByAdminId: "admin-001",
    adminNotes: "Đã xác nhận sự kiện gia đình. Chúc mừng gia đình!"
  },
  {
    id: "leave-008",
    driverId: "driver-013",
    driverInfo: {
      firstName: "Bùi",
      lastName: "Văn Minh",
      phoneNumber: "0905555555",
      email: "bui.van.minh@email.com",
      licenseNumber: "M456789123",
      vehicleId: "vehicle-013",
      vehicleInfo: {
        plateNumber: "51M-11111",
        model: "Mercedes Sprinter"
      }
    },
    leaveType: "Emergency",
    startDate: "2024-02-08T00:00:00Z",
    endDate: "2024-02-08T00:00:00Z",
    reason: "Con bị tai nạn ở trường, cần nghỉ để đưa con đi bệnh viện.",
    status: "Approved",
    submittedAt: "2024-02-08T11:45:00Z",
    reviewedAt: "2024-02-08T12:30:00Z",
    reviewedByAdminId: "admin-002",
    adminNotes: "Tình huống khẩn cấp gia đình. Mong con mau khỏe!"
  },
  {
    id: "leave-009",
    driverId: "driver-014",
    driverInfo: {
      firstName: "Lý",
      lastName: "Thị Nga",
      phoneNumber: "0904444444",
      email: "ly.thi.nga@email.com",
      licenseNumber: "N789123456",
      vehicleId: "vehicle-014",
      vehicleInfo: {
        plateNumber: "51N-22222",
        model: "Hyundai County"
      }
    },
    leaveType: "Vacation",
    startDate: "2024-02-20T00:00:00Z",
    endDate: "2024-02-25T00:00:00Z",
    reason: "Nghỉ phép để đi du lịch cùng bạn bè. Đã lên kế hoạch từ lâu.",
    status: "Pending",
    submittedAt: "2024-02-12T14:10:00Z"
  },
  {
    id: "leave-010",
    driverId: "driver-015",
    driverInfo: {
      firstName: "Tôn",
      lastName: "Văn Oanh",
      phoneNumber: "0903333333",
      email: "ton.van.oanh@email.com",
      licenseNumber: "O321654987",
      vehicleId: "vehicle-015",
      vehicleInfo: {
        plateNumber: "51O-33333",
        model: "Isuzu NPR"
      }
    },
    leaveType: "Sick",
    startDate: "2024-02-18T00:00:00Z",
    endDate: "2024-02-20T00:00:00Z",
    reason: "Bị cảm lạnh, ho nhiều, cần nghỉ để điều trị và phục hồi.",
    status: "Pending",
    submittedAt: "2024-02-17T18:30:00Z",
    attachments: [
      {
        id: "att-005",
        fileName: "cold_certificate.pdf",
        fileUrl: "/documents/cold_certificate.pdf",
        fileType: "PDF"
      }
    ]
  },
  {
    id: "leave-011",
    driverId: "driver-016",
    driverInfo: {
      firstName: "Phan",
      lastName: "Thị Phương",
      phoneNumber: "0902222222",
      email: "phan.thi.phuong@email.com",
      licenseNumber: "P654987321",
      vehicleId: "vehicle-016",
      vehicleInfo: {
        plateNumber: "51P-44444",
        model: "Mitsubishi Canter"
      }
    },
    leaveType: "Personal",
    startDate: "2024-02-22T00:00:00Z",
    endDate: "2024-02-24T00:00:00Z",
    reason: "Có việc nhà quan trọng, cần nghỉ để giải quyết các vấn đề cá nhân.",
    status: "Rejected",
    submittedAt: "2024-02-18T08:45:00Z",
    reviewedAt: "2024-02-19T09:20:00Z",
    reviewedByAdminId: "admin-001",
    rejectionReason: "Thời gian nghỉ trùng với ca cao điểm. Vui lòng chọn thời gian khác."
  },
  {
    id: "leave-012",
    driverId: "driver-017",
    driverInfo: {
      firstName: "Hồ",
      lastName: "Văn Quang",
      phoneNumber: "0901111111",
      email: "ho.van.quang@email.com",
      licenseNumber: "Q987321654",
      vehicleId: "vehicle-017",
      vehicleInfo: {
        plateNumber: "51Q-55555",
        model: "Nissan Urvan"
      }
    },
    leaveType: "Emergency",
    startDate: "2024-02-25T00:00:00Z",
    endDate: "2024-02-25T00:00:00Z",
    reason: "Gia đình có việc khẩn cấp, cần nghỉ ngay để xử lý tình huống.",
    status: "Approved",
    submittedAt: "2024-02-25T07:15:00Z",
    reviewedAt: "2024-02-25T08:00:00Z",
    reviewedByAdminId: "admin-002",
    adminNotes: "Tình huống khẩn cấp được xác nhận. Đã sắp xếp tài xế thay thế."
  }
];

// General Driver Requests
export const mockGeneralRequests: GeneralDriverRequest[] = [
  {
    id: "general-001",
    driverId: "driver-006",
    driverInfo: {
      firstName: "Võ",
      lastName: "Thị Phương",
      phoneNumber: "0903333333",
      email: "vo.thi.phuong@email.com",
      licenseNumber: "F654987321",
      vehicleId: "vehicle-006",
      vehicleInfo: {
        plateNumber: "51F-44444",
        model: "Mitsubishi Canter"
      }
    },
    requestType: "Route Change",
    title: "Yêu cầu thay đổi tuyến đường",
    description: "Tuyến đường hiện tại có nhiều công trình đang thi công, gây tắc nghẽn và chậm trễ. Đề xuất điều chỉnh tuyến đường để tránh khu vực này.",
    priority: "High",
    status: "Pending",
    submittedAt: "2024-01-28T10:15:00Z"
  },
  {
    id: "general-002",
    driverId: "driver-007",
    driverInfo: {
      firstName: "Đặng",
      lastName: "Văn Giang",
      phoneNumber: "0902222222",
      email: "dang.van.giang@email.com",
      licenseNumber: "G987321654",
      vehicleId: "vehicle-007",
      vehicleInfo: {
        plateNumber: "51G-55555",
        model: "Nissan Urvan"
      }
    },
    requestType: "Vehicle Issue",
    title: "Báo cáo sự cố động cơ",
    description: "Xe có tiếng động lạ từ động cơ khi khởi động và tăng tốc. Cần kiểm tra và sửa chữa để đảm bảo an toàn.",
    priority: "Urgent",
    status: "In Progress",
    submittedAt: "2024-01-27T08:30:00Z",
    resolvedAt: "2024-01-28T14:20:00Z",
    resolvedByAdminId: "admin-002",
    adminNotes: "Đã sắp xếp xe vào garage kiểm tra. Tạm thời phân công xe khác cho tài xế."
  },
  {
    id: "general-003",
    driverId: "driver-008",
    driverInfo: {
      firstName: "Bùi",
      lastName: "Thị Hoa",
      phoneNumber: "0901111111",
      email: "bui.thi.hoa@email.com",
      licenseNumber: "H147258369",
      vehicleId: "vehicle-008",
      vehicleInfo: {
        plateNumber: "51H-66666",
        model: "Toyota Coaster"
      }
    },
    requestType: "Schedule Adjustment",
    title: "Đề xuất điều chỉnh giờ làm việc",
    description: "Do tình hình giao thông thay đổi, đề xuất điều chỉnh giờ bắt đầu ca sáng từ 6:00 thành 6:30 để tránh giờ cao điểm.",
    priority: "Medium",
    status: "Resolved",
    submittedAt: "2024-01-26T15:45:00Z",
    resolvedAt: "2024-01-27T09:30:00Z",
    resolvedByAdminId: "admin-001",
    adminNotes: "Đã thảo luận với đội ngũ và điều chỉnh lịch trình phù hợp."
  },
  {
    id: "general-004",
    driverId: "driver-009",
    driverInfo: {
      firstName: "Ngô",
      lastName: "Văn Ích",
      phoneNumber: "0909999999",
      email: "ngo.van.ich@email.com",
      licenseNumber: "I369258147",
      vehicleId: "vehicle-009",
      vehicleInfo: {
        plateNumber: "51I-77777",
        model: "Ford E-Transit"
      }
    },
    requestType: "Training Request",
    title: "Yêu cầu đào tạo lái xe an toàn",
    description: "Muốn tham gia khóa đào tạo lái xe an toàn để nâng cao kỹ năng và kiến thức về an toàn giao thông.",
    priority: "Low",
    status: "Pending",
    submittedAt: "2024-01-29T11:20:00Z"
  },
  {
    id: "general-005",
    driverId: "driver-010",
    driverInfo: {
      firstName: "Đinh",
      lastName: "Thị Kim",
      phoneNumber: "0908888888",
      email: "dinh.thi.kim@email.com",
      licenseNumber: "J741852963",
      vehicleId: "vehicle-010",
      vehicleInfo: {
        plateNumber: "51J-88888",
        model: "Chevrolet Express"
      }
    },
    requestType: "Other",
    title: "Đề xuất cải thiện hệ thống GPS",
    description: "Hệ thống GPS hiện tại đôi khi không chính xác, đề xuất nâng cấp hoặc thay thế để cải thiện hiệu quả công việc.",
    priority: "Medium",
    status: "Pending",
    submittedAt: "2024-01-30T13:15:00Z"
  },
  {
    id: "general-006",
    driverId: "driver-018",
    driverInfo: {
      firstName: "Trương",
      lastName: "Văn Rồng",
      phoneNumber: "0907777777",
      email: "truong.van.rong@email.com",
      licenseNumber: "R123456789",
      vehicleId: "vehicle-018",
      vehicleInfo: {
        plateNumber: "51R-99999",
        model: "Toyota Hiace"
      }
    },
    requestType: "Route Change",
    title: "Đề xuất tuyến đường mới",
    description: "Tuyến đường hiện tại có nhiều điểm nghẽn vào giờ cao điểm. Đề xuất mở tuyến đường mới qua khu vực ít tắc nghẽn.",
    priority: "Medium",
    status: "Pending",
    submittedAt: "2024-02-01T09:30:00Z"
  },
  {
    id: "general-007",
    driverId: "driver-019",
    driverInfo: {
      firstName: "Lương",
      lastName: "Thị Sương",
      phoneNumber: "0906666666",
      email: "luong.thi.suong@email.com",
      licenseNumber: "S987654321",
      vehicleId: "vehicle-019",
      vehicleInfo: {
        plateNumber: "51S-00000",
        model: "Ford Transit"
      }
    },
    requestType: "Vehicle Issue",
    title: "Báo cáo lỗi hệ thống điều hòa",
    description: "Hệ thống điều hòa không hoạt động tốt, gây khó chịu cho hành khách. Cần kiểm tra và sửa chữa.",
    priority: "High",
    status: "In Progress",
    submittedAt: "2024-02-02T14:20:00Z",
    resolvedAt: "2024-02-03T10:15:00Z",
    resolvedByAdminId: "admin-001",
    adminNotes: "Đã sắp xếp xe vào garage để kiểm tra hệ thống điều hòa."
  },
  {
    id: "general-008",
    driverId: "driver-020",
    driverInfo: {
      firstName: "Đinh",
      lastName: "Văn Tùng",
      phoneNumber: "0905555555",
      email: "dinh.van.tung@email.com",
      licenseNumber: "T456789123",
      vehicleId: "vehicle-020",
      vehicleInfo: {
        plateNumber: "51T-11111",
        model: "Mercedes Sprinter"
      }
    },
    requestType: "Schedule Adjustment",
    title: "Yêu cầu điều chỉnh giờ nghỉ trưa",
    description: "Giờ nghỉ trưa hiện tại quá ngắn, không đủ thời gian để ăn uống và nghỉ ngơi. Đề xuất tăng thời gian nghỉ trưa.",
    priority: "Low",
    status: "Resolved",
    submittedAt: "2024-02-03T11:45:00Z",
    resolvedAt: "2024-02-04T08:30:00Z",
    resolvedByAdminId: "admin-002",
    adminNotes: "Đã điều chỉnh lịch trình để tăng thời gian nghỉ trưa cho tài xế."
  },
  {
    id: "general-009",
    driverId: "driver-021",
    driverInfo: {
      firstName: "Nguyễn",
      lastName: "Thị Uyên",
      phoneNumber: "0904444444",
      email: "nguyen.thi.uyen@email.com",
      licenseNumber: "U789123456",
      vehicleId: "vehicle-021",
      vehicleInfo: {
        plateNumber: "51U-22222",
        model: "Hyundai County"
      }
    },
    requestType: "Training Request",
    title: "Yêu cầu đào tạo kỹ năng giao tiếp",
    description: "Muốn tham gia khóa đào tạo kỹ năng giao tiếp với hành khách để cải thiện chất lượng phục vụ.",
    priority: "Medium",
    status: "Pending",
    submittedAt: "2024-02-04T16:10:00Z"
  },
  {
    id: "general-010",
    driverId: "driver-022",
    driverInfo: {
      firstName: "Phạm",
      lastName: "Văn Vinh",
      phoneNumber: "0903333333",
      email: "pham.van.vinh@email.com",
      licenseNumber: "V321654987",
      vehicleId: "vehicle-022",
      vehicleInfo: {
        plateNumber: "51V-33333",
        model: "Isuzu NPR"
      }
    },
    requestType: "Other",
    title: "Đề xuất cải thiện hệ thống báo cáo",
    description: "Hệ thống báo cáo hiện tại khá phức tạp và mất nhiều thời gian. Đề xuất đơn giản hóa quy trình báo cáo.",
    priority: "Low",
    status: "Pending",
    submittedAt: "2024-02-05T12:30:00Z"
  }
];

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API functions for testing
export const mockApiService = {
  get: async (url: string, params?: Record<string, unknown>) => {
    await simulateApiDelay(500);
    
    if (url.includes('/driver-leaves')) {
      let filteredData = [...mockDriverLeaves];
      
      // Apply filters
      if (params?.status) {
        filteredData = filteredData.filter(leave => leave.status === params.status);
      }
      
      if (params?.leaveType) {
        filteredData = filteredData.filter(leave => leave.leaveType === params.leaveType);
      }
      
      if (params?.driverName) {
        filteredData = filteredData.filter(leave => {
          const fullName = `${leave.driverInfo.firstName} ${leave.driverInfo.lastName}`.toLowerCase();
          return fullName.includes((params.driverName as string).toLowerCase());
        });
      }
      
      if (params?.driverEmail) {
        filteredData = filteredData.filter(leave => 
          leave.driverInfo.email.toLowerCase().includes((params.driverEmail as string).toLowerCase())
        );
      }
      
      // Apply pagination
      const skip = (params?.skip as number) || 0;
      const take = (params?.take as number) || 10;
      const paginatedData = filteredData.slice(skip, skip + take);
      
      return paginatedData;
    }
    
    if (url.includes('/general-requests')) {
      let filteredData = [...mockGeneralRequests];
      
      // Apply filters
      if (params?.status) {
        filteredData = filteredData.filter(request => request.status === params.status);
      }
      
      if (params?.requestType) {
        filteredData = filteredData.filter(request => request.requestType === params.requestType);
      }
      
      if (params?.priority) {
        filteredData = filteredData.filter(request => request.priority === params.priority);
      }
      
      if (params?.driverName) {
        filteredData = filteredData.filter(request => {
          const fullName = `${request.driverInfo.firstName} ${request.driverInfo.lastName}`.toLowerCase();
          return fullName.includes((params.driverName as string).toLowerCase());
        });
      }
      
      if (params?.driverEmail) {
        filteredData = filteredData.filter(request => 
          request.driverInfo.email.toLowerCase().includes((params.driverEmail as string).toLowerCase())
        );
      }
      
      // Apply pagination
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
    
    if (url.includes('/resolve')) {
      console.log('Resolving request:', data);
      return { success: true, message: 'Request resolved successfully' };
    }
    
    return { success: true };
  }
};
