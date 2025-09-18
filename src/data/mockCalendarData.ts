import { CalendarEvent } from '@/types';

// Mock data based on backend models
export const mockCalendarEvents: CalendarEvent[] = [
  // Trip events
  {
    id: '1',
    title: 'Route A - Morning Pickup',
    start: new Date(2024, 8, 10, 7, 0), // September 10, 2024, 7:00 AM
    end: new Date(2024, 8, 10, 8, 30),
    type: 'trip',
    status: 'in-progress',
    description: 'Morning pickup route for students in District A',
    routeId: 'route-1',
    tripId: 'trip-1',
    scheduleId: 'schedule-1',
    metadata: {
      driver: 'John Smith',
      vehicle: 'Bus-001',
      students: 25
    }
  },
  {
    id: '2',
    title: 'Route B - Afternoon Drop-off',
    start: new Date(2024, 8, 10, 15, 0), // September 10, 2024, 3:00 PM
    end: new Date(2024, 8, 10, 16, 30),
    type: 'trip',
    status: 'planned',
    description: 'Afternoon drop-off route for students in District B',
    routeId: 'route-2',
    tripId: 'trip-2',
    scheduleId: 'schedule-2',
    metadata: {
      driver: 'Sarah Johnson',
      vehicle: 'Bus-002',
      students: 18
    }
  },
  {
    id: '3',
    title: 'Route C - Evening Route',
    start: new Date(2024, 8, 10, 17, 0), // September 10, 2024, 5:00 PM
    end: new Date(2024, 8, 10, 18, 0),
    type: 'trip',
    status: 'completed',
    description: 'Evening route for late students',
    routeId: 'route-3',
    tripId: 'trip-3',
    scheduleId: 'schedule-3',
    metadata: {
      driver: 'Mike Wilson',
      vehicle: 'Bus-003',
      students: 12
    }
  },
  {
    id: '4',
    title: 'Route A - Morning Pickup',
    start: new Date(2024, 8, 11, 7, 0), // September 11, 2024, 7:00 AM
    end: new Date(2024, 8, 11, 8, 30),
    type: 'trip',
    status: 'planned',
    description: 'Morning pickup route for students in District A',
    routeId: 'route-1',
    tripId: 'trip-4',
    scheduleId: 'schedule-1',
    metadata: {
      driver: 'John Smith',
      vehicle: 'Bus-001',
      students: 25
    }
  },
  {
    id: '5',
    title: 'Route D - Special Event Transport',
    start: new Date(2024, 8, 12, 9, 0), // September 12, 2024, 9:00 AM
    end: new Date(2024, 8, 12, 11, 0),
    type: 'trip',
    status: 'planned',
    description: 'Transport for school field trip to Science Museum',
    routeId: 'route-4',
    tripId: 'trip-5',
    scheduleId: 'schedule-4',
    metadata: {
      driver: 'Emily Davis',
      vehicle: 'Bus-004',
      students: 30
    }
  },

  // Schedule events
  {
    id: '6',
    title: 'Regular Schedule - Route A',
    start: new Date(2024, 8, 10, 6, 30), // September 10, 2024, 6:30 AM
    end: new Date(2024, 8, 10, 6, 45),
    type: 'schedule',
    description: 'Daily schedule briefing for Route A drivers',
    scheduleId: 'schedule-1',
    metadata: {
      participants: ['John Smith', 'Route Supervisor']
    }
  },
  {
    id: '7',
    title: 'Weekly Route Planning',
    start: new Date(2024, 8, 13, 14, 0), // September 13, 2024, 2:00 PM
    end: new Date(2024, 8, 13, 15, 30),
    type: 'schedule',
    description: 'Weekly planning meeting for all routes',
    scheduleId: 'schedule-5',
    metadata: {
      participants: ['All Drivers', 'Route Manager', 'Admin']
    }
  },

  // Maintenance events
  {
    id: '8',
    title: 'Bus-001 - Regular Maintenance',
    start: new Date(2024, 8, 14, 8, 0), // September 14, 2024, 8:00 AM
    end: new Date(2024, 8, 14, 12, 0),
    type: 'maintenance',
    description: 'Monthly maintenance check for Bus-001',
    metadata: {
      vehicle: 'Bus-001',
      maintenanceType: 'Regular',
      technician: 'Tom Brown'
    }
  },
  {
    id: '9',
    title: 'Bus-002 - Oil Change',
    start: new Date(2024, 8, 15, 9, 0), // September 15, 2024, 9:00 AM
    end: new Date(2024, 8, 15, 10, 30),
    type: 'maintenance',
    description: 'Oil change and filter replacement',
    metadata: {
      vehicle: 'Bus-002',
      maintenanceType: 'Oil Change',
      technician: 'Lisa Green'
    }
  },

  // Other events
  {
    id: '10',
    title: 'Driver Training Session',
    start: new Date(2024, 8, 16, 10, 0), // September 16, 2024, 10:00 AM
    end: new Date(2024, 8, 16, 12, 0),
    type: 'other',
    description: 'Safety training session for all drivers',
    metadata: {
      trainer: 'Safety Officer',
      participants: 'All Drivers'
    }
  },
  {
    id: '11',
    title: 'Route Optimization Meeting',
    start: new Date(2024, 8, 17, 13, 0), // September 17, 2024, 1:00 PM
    end: new Date(2024, 8, 17, 14, 30),
    type: 'other',
    description: 'Meeting to discuss route optimization strategies',
    metadata: {
      participants: ['Route Manager', 'Admin', 'City Planner']
    }
  },

  // More events for different days
  {
    id: '12',
    title: 'Route E - Weekend Service',
    start: new Date(2024, 8, 14, 8, 0), // September 14, 2024, 8:00 AM
    end: new Date(2024, 8, 14, 9, 0),
    type: 'trip',
    status: 'planned',
    description: 'Weekend service for special events',
    routeId: 'route-5',
    tripId: 'trip-6',
    scheduleId: 'schedule-6',
    metadata: {
      driver: 'Alex Chen',
      vehicle: 'Bus-005',
      students: 15
    }
  },
  {
    id: '13',
    title: 'Emergency Drill',
    start: new Date(2024, 8, 18, 11, 0), // September 18, 2024, 11:00 AM
    end: new Date(2024, 8, 18, 12, 0),
    type: 'other',
    description: 'Emergency evacuation drill for all vehicles',
    metadata: {
      coordinator: 'Safety Officer',
      participants: 'All Staff'
    }
  }
];

// Sample routes data
export const mockRoutes = [
  {
    id: 'route-1',
    routeName: 'District A - Main Route',
    isActive: true,
    vehicleId: 1,
    pickupPoints: [
      {
        pickupPointId: 'point-1',
        sequenceOrder: 1,
        location: {
          latitude: 10.762622,
          longitude: 106.660172,
          address: '123 Main Street, District A'
        }
      },
      {
        pickupPointId: 'point-2',
        sequenceOrder: 2,
        location: {
          latitude: 10.763622,
          longitude: 106.661172,
          address: '456 Oak Avenue, District A'
        }
      }
    ]
  },
  {
    id: 'route-2',
    routeName: 'District B - Secondary Route',
    isActive: true,
    vehicleId: 2,
    pickupPoints: [
      {
        pickupPointId: 'point-3',
        sequenceOrder: 1,
        location: {
          latitude: 10.764622,
          longitude: 106.662172,
          address: '789 Pine Street, District B'
        }
      }
    ]
  }
];

// Sample schedules data
export const mockSchedules = [
  {
    id: 'schedule-1',
    name: 'Morning Route A',
    startTime: '07:00',
    endTime: '08:30',
    rrule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
    timezone: 'Asia/Ho_Chi_Minh',
    effectiveFrom: '2024-09-01T00:00:00Z',
    effectiveTo: '2024-12-31T23:59:59Z',
    exceptions: [],
    scheduleType: 'regular',
    isActive: true
  },
  {
    id: 'schedule-2',
    name: 'Afternoon Route B',
    startTime: '15:00',
    endTime: '16:30',
    rrule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
    timezone: 'Asia/Ho_Chi_Minh',
    effectiveFrom: '2024-09-01T00:00:00Z',
    effectiveTo: '2024-12-31T23:59:59Z',
    exceptions: [],
    scheduleType: 'regular',
    isActive: true
  }
];
