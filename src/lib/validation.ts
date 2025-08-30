import {
  AccountFormErrors,
  DriverAccountData,
  ParentAccountData,
} from "@/types";

export const validateDriver = (data: DriverAccountData): AccountFormErrors => {
  const errors: AccountFormErrors = {};
  if (!data.email) errors.email = "Email is required";
  if (!data.firstName) errors.firstName = "First name is required";
  if (!data.lastName) errors.lastName = "Last name is required";
  if (!data.address) errors.address = "Address is required";
  if (!data.phoneNumber) errors.phoneNumber = "Phone number is required";
  if (!data.gender) errors.gender = "Gender is required";
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  return errors;
};

export const validateParent = (data: ParentAccountData): AccountFormErrors => {
  const errors: AccountFormErrors = {};
  if (!data.email) errors.email = "Email is required";
  if (!data.firstName) errors.firstName = "First name is required";
  if (!data.lastName) errors.lastName = "Last name is required";
  if (!data.phoneNumber) errors.phoneNumber = "Phone number is required";
  if (!data.address) errors.address = "Address is required";
  if (!data.gender) errors.gender = "Gender is required";
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  
  // Validate gender values
  const validGenders = ["male", "female", "other"];
  if (data.gender && !validGenders.includes(data.gender)) {
    errors.gender = "Gender must be male, female, or other";
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.email = "Invalid email format";
  }
  
  // Validate phone number format (basic)
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (data.phoneNumber && !phoneRegex.test(data.phoneNumber)) {
    errors.phoneNumber = "Invalid phone number format";
  }
  
  return errors;
};
