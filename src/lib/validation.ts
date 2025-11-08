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
  
  // Validate date of birth for driver
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the future
    if (birthDate > today) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    } else {
      // Check if driver is at least 18 years old (legal driving age)
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }
      
      if (actualAge < 18) {
        errors.dateOfBirth = "Driver must be at least 18 years old";
      }
      
      // Check if date is not too far in the past (reasonable age limit, e.g., 100 years)
      if (actualAge > 100) {
        errors.dateOfBirth = "Date of birth seems invalid. Please check the year.";
      }
    }
  }
  
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
  
  // Validate date of birth
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the future
    if (birthDate > today) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    } else {
      // Check if person is at least 18 years old
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }
      
      if (actualAge < 18) {
        errors.dateOfBirth = "Parent must be at least 18 years old";
      }
      
      // Check if date is not too far in the past (reasonable age limit, e.g., 100 years)
      if (actualAge > 100) {
        errors.dateOfBirth = "Date of birth seems invalid. Please check the year.";
      }
    }
  }
  
  return errors;
};
