export interface Student {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  parent: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female';
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    role: 'parent';
  };
}

export interface CreateStudentRequest {
  parentId?: string;
  firstName: string;
  lastName: string;
  parentEmail: string;
}

export interface UpdateStudentRequest {
  parentId?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  parentPhoneNumber: string;
}

export enum StudentStatus {
  Available = 0,
  Pending = 1,
  Active = 2,
  Inactive = 3,
  Deleted = 4
}

export interface StudentDto {
  id: string;
  parentId?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  parentPhoneNumber: string;
  status: StudentStatus;
}

export interface ImportStudentSuccess {
  firstName: string;
  lastName: string;
  parentPhoneNumber: string;
}

export interface ImportStudentError {
  rowNumber: number;
  firstName: string;
  lastName: string;
  parentPhoneNumber: string;
  errorMessage: string;
}

export interface ImportStudentResult {
  totalProcessed: number;
  successfulStudents: ImportStudentSuccess[];  
  failedStudents: ImportStudentError[];        
}
