import { apiService } from "@/lib/api";
import { CreateUserResponse } from "./parents";


export const linkStudentsToParent = async (parentId: string, studentIds: string[]) => {
  return await apiService.patch(`/Student/bulk-assign-parent`, {
    parentId,
    studentIds
  });
};

export const createPickupPointByAdmin = async (data: {
  parentId: string;
  studentIds: string[];
  addressText: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  description?: string;
}) => {
  return await apiService.post(`/PickupPoint/admin/create`, data);
};

export const createTransactionByAdmin = async (data: {
  parentId: string;
  studentIds: string[];
  amount: number;
  description: string;
  dueDate?: string; 
  metadata?: {
    distanceKm: number;
    perTripFee: number;
    totalSchoolDays: number;
    totalTrips: number;
  };
}) => {
  return await apiService.post(`/Transaction/admin/create`, data);
};

export const createParentWithFullSetup = async (
  parentData: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: number;
    dateOfBirth: string;
    address: string;
  },
  setupData: {
    studentIds: string[];
    pickupPoint: {
      addressText: string;
      latitude: number;
      longitude: number;
      distanceKm: number;
    };
    feeCalculation: {
      perTripFee: number;
      semesterFee: number;
      totalSchoolDays: number;
      totalTrips: number;
    };
  }
) => {

  try {
    const parentResponse = await apiService.post<CreateUserResponse>(`/parent`, parentData);
    const parentId = parentResponse.id;

    await linkStudentsToParent(parentId, setupData.studentIds);

    await createPickupPointByAdmin({
      parentId,
      studentIds: setupData.studentIds,
      addressText: setupData.pickupPoint.addressText,
      latitude: setupData.pickupPoint.latitude,
      longitude: setupData.pickupPoint.longitude,
      distanceKm: setupData.pickupPoint.distanceKm,
      description: `Admin-created pickup point for ${parentData.firstName} ${parentData.lastName}`,
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); 

    await createTransactionByAdmin({
      parentId,
      studentIds: setupData.studentIds,
      amount: setupData.feeCalculation.semesterFee,
      description: `Semester transportation fee - ${setupData.studentIds.length} student(s)`,
      dueDate: dueDate.toISOString().split('T')[0],
      metadata: {
        distanceKm: setupData.pickupPoint.distanceKm,
        perTripFee: setupData.feeCalculation.perTripFee,
        totalSchoolDays: setupData.feeCalculation.totalSchoolDays,
        totalTrips: setupData.feeCalculation.totalTrips,
      },
    });

    return {
      success: true,
      parentId,
      password: parentResponse.password,
    };
  } catch (error) {
    console.error('Error in createParentWithFullSetup:', error);
    throw error;
  }
};
