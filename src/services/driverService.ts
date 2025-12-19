import { apiService } from '@/lib/api';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber?: string;
  status: string;
  email: string;
}

export interface DriverResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: number;
  dateOfBirth: string;
  address: string;
}

export interface DriverListResponse {
  success: boolean;
  data: Driver[];
  message?: string;
}

export class DriverService {
  async getDrivers(): Promise<DriverListResponse> {
    try {
      const response = await apiService.get<DriverResponse[]>('/Driver');
      
      const drivers = response.map(driver => ({
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phoneNumber: driver.phoneNumber,
        licenseNumber: undefined, 
        status: 'Active', 
        email: driver.email
      }));

      return {
        success: true,
        data: drivers,
        message: `Found ${drivers.length} drivers`
      };
    } catch (error: unknown) {
      console.error('Error fetching drivers from Driver API:', error);
      
      
      return this.getMockDrivers();
    }
  }

  async getDriverById(driverId: string): Promise<DriverListResponse> {
    try {
      const response = await apiService.get<DriverResponse>(`/Driver/${driverId}`);
      
      if (!response) {
        throw new Error('Driver not found');
      }

      const driver: Driver = {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        phoneNumber: response.phoneNumber,
        licenseNumber: undefined,
        status: 'Active',
        email: response.email
      };

      return {
        success: true,
        data: [driver],
        message: 'Driver found'
      };
    } catch (error: unknown) {
      console.error('Error fetching driver by ID:', error);
      throw error;
    }
  }

  
  private getMockDrivers(): DriverListResponse {
    const mockDrivers: Driver[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Driver',
        phoneNumber: '0123456789',
        licenseNumber: 'B2-123456',
        status: 'Active',
        email: 'john.driver@edubus.com'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '0987654321',
        licenseNumber: 'B2-654321',
        status: 'Active',
        email: 'jane.smith@edubus.com'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        phoneNumber: '0555666777',
        licenseNumber: 'B2-789012',
        status: 'Active',
        email: 'mike.johnson@edubus.com'
      }
    ];

    return {
      success: true,
      data: mockDrivers,
      message: 'Using mock data (Driver API error)'
    };
  }
}

export const driverService = new DriverService();
export default driverService;
