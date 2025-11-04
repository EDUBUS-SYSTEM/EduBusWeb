import { apiService } from "@/lib/api";
import { CreateUserResponse } from "./parents";

/**
 * Admin-specific services for creating parent accounts with full setup
 * These APIs need to be implemented by backend team
 */

// Update students to link them with parent
export const linkStudentsToParent = async (parentId: string, studentIds: string[]) => {
  // Backend needs to implement: PATCH /api/Student/bulk-assign-parent
  return await apiService.patch(`/Student/bulk-assign-parent`, {
    parentId,
    studentIds
  });
};

// Create pickup point for admin (auto-approved)
export const createPickupPointByAdmin = async (data: {
  parentId: string;
  studentIds: string[];
  addressText: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  description?: string;
}) => {
  // Backend needs to implement: POST /api/PickupPoint/admin/create
  return await apiService.post(`/PickupPoint/admin/create`, data);
};

// Create transaction for parent
export const createTransactionByAdmin = async (data: {
  parentId: string;
  studentIds: string[];
  amount: number;
  description: string;
  dueDate?: string; // Optional due date for payment
  metadata?: {
    distanceKm: number;
    perTripFee: number;
    totalSchoolDays: number;
    totalTrips: number;
  };
}) => {
  // Backend needs to implement: POST /api/Transaction/admin/create
  return await apiService.post(`/Transaction/admin/create`, data);
};

/**
 * Complete parent setup workflow
 * This is a convenience function that calls all required APIs in sequence
 */
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
  // This function orchestrates the entire workflow
  // In the future, backend might provide a single endpoint for this
  // For now, we call multiple endpoints sequentially

  try {
    // Step 1: Create parent account
    const parentResponse = await apiService.post<CreateUserResponse>(`/parent`, parentData);
    const parentId = parentResponse.id;

    // Step 2: Link students to parent
    await linkStudentsToParent(parentId, setupData.studentIds);

    // Step 3: Create pickup point (auto-approved by admin)
    await createPickupPointByAdmin({
      parentId,
      studentIds: setupData.studentIds,
      addressText: setupData.pickupPoint.addressText,
      latitude: setupData.pickupPoint.latitude,
      longitude: setupData.pickupPoint.longitude,
      distanceKm: setupData.pickupPoint.distanceKm,
      description: `Admin-created pickup point for ${parentData.firstName} ${parentData.lastName}`,
    });

    // Step 4: Create transaction with semester fee
    // Due date: 7 days before semester starts (example)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

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
