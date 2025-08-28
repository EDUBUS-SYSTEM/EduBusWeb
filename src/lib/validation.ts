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
  if (!data.password) errors.password = "Password is required";
  if (!data.firstName) errors.firstName = "First name is required";
  if (!data.lastName) errors.lastName = "Last name is required";
  if (!data.phoneNumber) errors.phoneNumber = "Phone number is required";
  if (!data.gender) errors.gender = "Gender is required";
  if (!data.students || data.students.length === 0)
    errors.students = "At least one student is required";
  return errors;
};
