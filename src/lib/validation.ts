import {
  AccountFormErrors,
  DriverAccountData,
  ParentAccountData,
  SupervisorAccountData,
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
  
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (birthDate > today) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    } else {
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
  
  const validGenders = ["male", "female", "other"];
  if (data.gender && !validGenders.includes(data.gender)) {
    errors.gender = "Gender must be male, female, or other";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.email = "Invalid email format";
  }
  
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (data.phoneNumber && !phoneRegex.test(data.phoneNumber)) {
    errors.phoneNumber = "Invalid phone number format";
  }
  
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (birthDate > today) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    } else {
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
      
      if (actualAge > 100) {
        errors.dateOfBirth = "Date of birth seems invalid. Please check the year.";
      }
    }
  }
  
  return errors;
};

export const validateSupervisor = (
  data: SupervisorAccountData
): AccountFormErrors => {
  const errors: AccountFormErrors = {};
  if (!data.email) errors.email = "Email is required";
  if (!data.firstName) errors.firstName = "First name is required";
  if (!data.lastName) errors.lastName = "Last name is required";
  if (!data.address) errors.address = "Address is required";
  if (!data.phoneNumber) errors.phoneNumber = "Phone number is required";
  if (!data.gender) errors.gender = "Gender is required";
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.email = "Invalid email format";
  }

  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (data.phoneNumber && !phoneRegex.test(data.phoneNumber)) {
    errors.phoneNumber = "Invalid phone number format";
  }

  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    } else {
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }

      if (actualAge < 18) {
        errors.dateOfBirth = "Supervisor must be at least 18 years old";
      }

      if (actualAge > 100) {
        errors.dateOfBirth =
          "Date of birth seems invalid. Please check the year.";
      }
    }
  }

  return errors;
};
