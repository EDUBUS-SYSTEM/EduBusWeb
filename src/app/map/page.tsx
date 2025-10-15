'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import VietMapPageComponent from '@/components/VietMapPageComponent';
import { pickupPointService } from '@/services/pickupPointService';
import { vietmapService, VietMapGeocodeResult } from '@/services/vietmapService';
import { unitPriceService, UnitPriceResponseDto } from '@/services/unitPriceService';
// import { transactionService, CalculateFeeResponse } from '@/services/transactionService';

type Student = {
  id?: string | number;
  fullName?: string;
  name?: string;
};

const SCHOOL_LOCATION = {
  lat: 15.9796,
  lng: 108.2605
};

// Constants
// const MAP_ZOOM_LEVEL = 14;
// const MAP_ZOOM_LEVEL_DETAILED = 15;

export default function MapPage() {
  const router = useRouter();
  // const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  // const schoolMarkerRef = useRef<HTMLDivElement | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VietMapGeocodeResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [fare, setFare] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  type TravelModeString = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  const [travelMode, setTravelMode] = useState<TravelModeString>('DRIVING');
  const [isRouting, setIsRouting] = useState(false);

  // Parent email and students
  const [parentEmail, setParentEmail] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  // const [studentsLoading, setStudentsLoading] = useState(false); // Removed - not used anymore
  const [studentsError, setStudentsError] = useState('');

  // Selected coords from clicks/search
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Temporary selection state for better UX
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [, setShowConfirmModal] = useState(false);
  const [tempDistance, setTempDistance] = useState<string>('');
  const [tempDuration, setTempDuration] = useState<string>('');
  const [tempFare, setTempFare] = useState<string>('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  
  // Track click state for route display
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  // const [isRouteDisplayed, setIsRouteDisplayed] = useState(false);
  
  // Submit request state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Unit price state
  const [unitPrice, setUnitPrice] = useState<UnitPriceResponseDto | null>(null);
  const [unitPriceLoading, setUnitPriceLoading] = useState(true);
  const [unitPriceError, setUnitPriceError] = useState('');
  
  // Semester fee calculation state
  const [semesterFeeInfo, setSemesterFeeInfo] = useState<unknown | null>(null);
  const [semesterFeeLoading, setSemesterFeeLoading] = useState(false);
  const [semesterFeeError, setSemesterFeeError] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Calculate semester fee when distance changes
  const calculateSemesterFee = useCallback(async (distanceKm: number) => {
    if (!distanceKm || distanceKm <= 0) return;
    
    try {
      setSemesterFeeLoading(true);
      setSemesterFeeError('');
      
      console.log('Calculating semester fee for distance:', distanceKm);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
      
      // Use direct fetch instead of service
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/Transaction/calculate-fee`;
      console.log('Testing API URL:', apiUrl);
      
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ distanceKm: distanceKm })
      });
      
      console.log('Response status:', fetchResponse.status);
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${fetchResponse.status}, message: ${errorText}`);
      }
      
      const data = await fetchResponse.json();
      console.log('API response:', data);
      setSemesterFeeInfo(data);
    } catch (error) {
      console.error('Error calculating semester fee:', error);
      console.error('Error details:', error);
      
      // More detailed error message
      let errorMessage = 'Unable to calculate semester fee. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string; detail?: string } } };
        errorMessage = apiError.response?.data?.message || apiError.response?.data?.detail || errorMessage;
      }
      
      setSemesterFeeError(errorMessage);
    } finally {
      setSemesterFeeLoading(false);
    }
  }, []);

  // FPT School Đà Nẵng - Khu A3-1, Khu đô thị Công nghệ FPT, phường Hòa Hải, quận Ngũ Hành Sơn
  const schoolLocation = SCHOOL_LOCATION;

  // Distance will be calculated from Directions result (driving distance)

  // Memoized route drawing - now handled by VietMapPageComponent
  const drawRoute = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, options?: { fitBounds?: boolean }) => {
    // Route calculation is now handled by VietMapPageComponent using VietMap API
    // This function is kept for compatibility but the actual route drawing happens in the component
    console.log('Route drawing requested:', { origin, destination });
  }, []);

  // Draw temporary route with different styling (optimized to prevent excessive API calls)
  const drawTempRouteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const drawTempRoute = useCallback(async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;

    // Clear previous timeout
    if (drawTempRouteTimeoutRef.current) {
      clearTimeout(drawTempRouteTimeoutRef.current);
    }

    // Debounce temp route calculation
    drawTempRouteTimeoutRef.current = setTimeout(async () => {
      try {
        // Use VietMap API for actual route calculation
        const data = await vietmapService.getRoute(origin, destination, 'car');
        
        if (data.paths && data.paths.length > 0) {
          const path = data.paths[0];
          
          // Calculate distance and duration from actual route
          const distanceKm = (path.distance / 1000).toFixed(2);
          const durationMs = path.time; // Already in milliseconds
          const minutes = Math.round(durationMs / (1000 * 60));
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          
          setTempDistance(`${distanceKm} km`);
          setTempDuration(hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`);

          // Calculate fare based on actual distance and current unit price
          const currentUnitPrice = unitPrice?.pricePerKm || 7000;
          const fareNumber = parseFloat(distanceKm) * currentUnitPrice;
          const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));
          setTempFare(formattedFare);
          setFare(formattedFare); // Set the main fare variable
          
          // Calculate semester fee
          calculateSemesterFee(parseFloat(distanceKm));
        }
      } catch (error) {
        console.error('Error calculating temp route:', error);
        
        // Fallback to straight line calculation
        const distanceKm = Math.sqrt(
          Math.pow(destination.lat - origin.lat, 2) + Math.pow(destination.lng - origin.lng, 2)
        ) * 111; // Rough conversion to km
        const minutes = Math.round(distanceKm * 2); // Rough estimate: 2 minutes per km
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        setTempDistance(`${distanceKm.toFixed(2)} km`);
        setTempDuration(hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`);

        // Calculate fare using current unit price
        const currentUnitPrice = unitPrice?.pricePerKm || 7000;
        const fareNumber = distanceKm * currentUnitPrice;
        const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));
        setTempFare(formattedFare);
        setFare(formattedFare); // Set the main fare variable
        
        // Calculate semester fee
        calculateSemesterFee(distanceKm);
      }
    }, 300); // 300ms debounce delay
  }, [unitPrice, calculateSemesterFee]);

  // Calculate temporary route for preview
  const calculateTempRoute = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    // Simulate route calculation for VietMap
    const distanceKm = Math.sqrt(
      Math.pow(lat - schoolLocation.lat, 2) + Math.pow(lng - schoolLocation.lng, 2)
    ) * 111; // Rough conversion to km
    const minutes = Math.round(distanceKm * 2); // Rough estimate: 2 minutes per km
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
    
    setTempDistance(`${distanceKm.toFixed(2)} km`);
            setTempDuration(hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`);

            // Calculate fare using current unit price
    const currentUnitPrice = unitPrice?.pricePerKm || 7000;
    const fareNumber = distanceKm * currentUnitPrice;
            const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));
            setTempFare(formattedFare);
            setFare(formattedFare); // Set the main fare variable
            
            // Calculate semester fee
            calculateSemesterFee(distanceKm);
  }, [schoolLocation, unitPrice, calculateSemesterFee]);

  // Confirm location selection
  const confirmLocationSelection = useCallback((lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setTempCoords(null);
    setShowConfirmModal(false);
    setShowSubmitForm(true);
    
    // Set final values from temp values
    setDistance(tempDistance);
    setDuration(tempDuration);
    setFare(tempFare);
    
    // Create final marker
    if (markerRef.current) {
      markerRef.current = null;
    }

    // Draw final route
    drawRoute(schoolLocation, { lat, lng });
  }, [drawRoute, schoolLocation, tempDistance, tempDuration, tempFare]);

  // Create temporary marker for preview
  const createTempMarker = useCallback((lat: number, lng: number, map: HTMLDivElement | null) => {
    console.log('Creating temp marker at:', lat, lng, 'on map:', map);
    
    // Remove existing temp marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Set temp coords and calculate route
    setTempCoords({ lat, lng });
    calculateTempRoute(lat, lng);
    
    // Draw temporary route to show the path
    drawTempRoute(schoolLocation, { lat, lng });
    
    console.log('Temp marker created at:', lat, lng);
  }, [calculateTempRoute, drawTempRoute, schoolLocation]);

  // Create home marker (legacy function for search)
  // const createHomeMarker = useCallback((lat: number, lng: number) => {
  //   confirmLocationSelection(lat, lng);
  // }, [confirmLocationSelection]);


  // Handle map ready
  const handleMapReady = useCallback((map: unknown) => {
        mapInstanceRef.current = map as HTMLDivElement | null;
  }, []);

  // Handle map click
  const handleMapClick = useCallback((coords: { lat: number; lng: number }) => {
    console.log('Map clicked at:', coords);
    
    // If same coordinates clicked again, show confirm form
    if (clickedCoords && 
        Math.abs(clickedCoords.lat - coords.lat) < 0.0001 && 
        Math.abs(clickedCoords.lng - coords.lng) < 0.0001) {
      console.log('Same coordinates clicked, showing confirm form');
      confirmLocationSelection(coords.lat, coords.lng);
      return;
    }

    // First click: show route
    console.log('First click, setting temp coords and showing route');
    setClickedCoords(coords);
    // setIsRouteDisplayed(true);
    setTempCoords(coords);
    createTempMarker(coords.lat, coords.lng, mapInstanceRef.current);
  }, [createTempMarker, clickedCoords, confirmLocationSelection]);

  // Handle marker click
  const handleMarkerClick = useCallback((coords: { lat: number; lng: number }) => {
    confirmLocationSelection(coords.lat, coords.lng);
  }, [confirmLocationSelection]);

  // Handle route calculation from VietMap component
  const handleRouteCalculated = useCallback((distance: string, duration: string, fare: string) => {
    setTempDistance(distance);
    setTempDuration(duration);
    setTempFare(fare);
    setFare(fare); // Set the main fare variable
  }, []);

  // Load students when parent email changes
  useEffect(() => {
    const loadStudents = async () => {
      if (!parentEmail.trim()) {
        setStudents([]);
        setStudentsError('');
        return;
      }

      try {
        setStudentsError('');
        // Note: This would need to be implemented in the backend
        // For now, we'll use a mock response
        const mockStudents = [
          { id: '1', fullName: 'Student 1', name: 'Student 1' },
          { id: '2', fullName: 'Student 2', name: 'Student 2' }
        ];
        setStudents(mockStudents);
      } catch (err) {
        console.error('Error loading students:', err);
        setStudentsError('Failed to load students. Please check the email address.');
        setStudents([]);
      }
    };

    loadStudents();
  }, [parentEmail]);

  // Handle search with VietMap Geocoding API
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      console.log('Search query is empty');
      return;
    }
    
    if (!mapInstanceRef.current) {
      console.log('Map instance not ready');
      return;
    }
    
    if (!isMapLoaded) {
      console.log('Map not loaded yet');
      return;
    }

    console.log('Starting search for:', searchQuery);
    setError('');
    setIsSearching(true);
    setShowSearchResults(false);
    
    try {
      console.log('Calling vietmapService.geocode...');
      const results = await vietmapService.geocode(searchQuery, schoolLocation);
      console.log('Search results:', results);
      
      setSearchResults(results);
      setShowSearchResults(true);
      
      if (results.length > 0) {
        // Auto-select first result
        const firstResult = results[0];
        console.log('Auto-selecting first result:', firstResult);
        
        // Extract coordinates from boundaries or use mock coordinates
        const mockCoords = {
          lat: 16.0544 + (Math.random() - 0.5) * 0.1,
          lng: 108.2022 + (Math.random() - 0.5) * 0.1
        };
        
        setClickedCoords(mockCoords);
        // setIsRouteDisplayed(true);
        setTempCoords(mockCoords);
        
        // Don't call createTempMarker here, let the component handle it via tempCoords
        console.log('Setting tempCoords to:', mockCoords);
        
        setSearchQuery(firstResult.display);
        setShowSearchResults(false);
      } else {
        console.log('No search results found');
        setError('No results found for the search query.');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      setError(`An error occurred while searching for the address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, isMapLoaded, schoolLocation]);

  // Debounced autocomplete to prevent excessive API calls
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearchInputChange = useCallback(async (value: string) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }
    
    if (value.trim().length >= 2) {
      // Debounce autocomplete requests
      autocompleteTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('Starting autocomplete for:', value);
          const results = await vietmapService.autocomplete(value, schoolLocation);
          console.log('Autocomplete results:', results);
          
          // Convert autocomplete results to geocode format
          const convertedResults = results.map(result => ({
            ref_id: result.ref_id,
            distance: result.distance,
            address: result.address,
            name: result.name,
            display: result.display,
            boundaries: result.boundaries,
            categories: result.categories,
            entry_points: result.entry_points,
            data_old: result.data_old,
            data_new: result.data_new
          }));
          
          setSearchResults(convertedResults);
          setShowSearchResults(true);
          console.log('Search results set:', convertedResults);
        } catch (error) {
          console.error('Error with autocomplete:', error);
          // Don't show error for autocomplete, just fail silently
          setSearchResults([]);
          setShowSearchResults(false);
        }
      }, 500); // 500ms debounce delay
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [schoolLocation]);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result: VietMapGeocodeResult) => {
    console.log('Search result selected:', result);
    
    // Extract coordinates from boundaries or use mock coordinates
    // Since v4 API doesn't provide lat/lng directly, we'll use mock coordinates around Da Nang
    const mockCoords = {
      lat: 16.0544 + (Math.random() - 0.5) * 0.1,
      lng: 108.2022 + (Math.random() - 0.5) * 0.1
    };
    
    setSearchQuery(result.display);
    setClickedCoords(mockCoords);
    // setIsRouteDisplayed(true);
    setTempCoords(mockCoords);
    // Don't call createTempMarker here, let the component handle it via tempCoords
    setShowSearchResults(false);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSearchResults]);

  // Recalculate route when travel mode changes (if home marker exists)
  useEffect(() => {
    if (!isMapLoaded) return;
    if (selectedCoords) {
      drawRoute(schoolLocation, selectedCoords);
    }
  }, [travelMode, isMapLoaded, drawRoute, schoolLocation, selectedCoords]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
      if (drawTempRouteTimeoutRef.current) {
        clearTimeout(drawTempRouteTimeoutRef.current);
      }
    };
  }, []);


  // Submit pickup point request
  const handleSubmitRequest = async () => {
    if (!selectedCoords || !parentEmail || students.length === 0) {
      setSubmitError('Please select a location and ensure students are loaded.');
      return;
    }

    if (!distance || parseFloat(distance.replace(' km', '')) <= 0) {
      setSubmitError('Please ensure distance is calculated correctly.');
      return;
    }

    if (!unitPrice) {
      setSubmitError('Unit price is not loaded. Please refresh the page and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const distanceKm = parseFloat(distance.replace(' km', '')) || 0;

      const payload = {
        email: parentEmail,
        studentIds: students.map(s => s.id?.toString() || ''),
        addressText: searchQuery || 'Selected location',
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        distanceKm: distanceKm,
        description: `Pickup point request for ${students.length} student(s)`,
        reason: 'Parent requested pickup point service'
      };

      const result = await pickupPointService.submitRequest(payload);
      setSubmitSuccess(result.message || 'Request submitted successfully!');
      
      // Clear form after successful submission
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { title?: string; detail?: string; message?: string } } }).response?.data;
      setSubmitError(message?.detail || message?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load unit price from API
  useEffect(() => {
    const loadUnitPrice = async () => {
      try {
        setUnitPriceLoading(true);
        setUnitPriceError('');
        const response = await unitPriceService.getCurrentEffective();
        setUnitPrice(response);
      } catch (error) {
        console.error('Error loading unit price:', error);
        setUnitPriceError('Unable to load current pricing. Using default rate.');
        // Fallback to default price if API fails
        setUnitPrice({
          id: 'default',
          name: 'Default Price',
          description: 'Default pricing',
          pricePerKm: 7000,
          effectiveFrom: new Date().toISOString(),
          isActive: true,
          isDeleted: false,
          byAdminId: 'system',
          byAdminName: 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } finally {
        setUnitPriceLoading(false);
      }
    };

    loadUnitPrice();
  }, []);

  // Load parent email from previous step
  useEffect(() => {
    try {
      const email = sessionStorage.getItem('parentEmail') || '';
      setParentEmail(email);
    } catch (error) {
      console.warn('Unable to access sessionStorage:', error);
      setParentEmail('');
    }
  }, []);

  // Load students from sessionStorage (set by verify-otp page)
  const loadStudentsFromStorage = useCallback(() => {
    try {
      const storedStudents = sessionStorage.getItem('parentStudents');
      const storedEmailExists = sessionStorage.getItem('parentEmailExists');
      
      if (storedStudents) {
        const parsedStudents = JSON.parse(storedStudents);
        setStudents(parsedStudents.map((s: { id: string; firstName: string; lastName: string }) => ({
          id: s.id,
          fullName: `${s.firstName} ${s.lastName}`,
          name: `${s.firstName} ${s.lastName}`
        })));
      }
      
      if (storedEmailExists) {
        // Email exists info is available but not used in current UI
        console.log('Email exists in system:', storedEmailExists === 'true');
      }
    } catch (error) {
      console.error('Error loading students from storage:', error);
      setStudentsError('Unable to load students data. Please refresh the page and try again.');
    }
  }, []);

  useEffect(() => {
    if (parentEmail) {
      loadStudentsFromStorage();
    }
  }, [parentEmail, loadStudentsFromStorage]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#FEFCE8] to-[#FFF085] shadow-soft"
      >
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/edubus_logo.png"
              alt="EduBus Logo"
              width={60}
              height={60}
              className="drop-shadow-lg"
            />
          </motion.div>
          <span className="text-2xl font-bold text-[#463B3B]">EduBus - Find Route</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-[#fad23c] to-[#FFF085] text-[#463B3B] px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Back to Home
        </motion.button>
      </motion.header>

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] px-6 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Find distance from home to school
            </h1>
            <p className="text-[#463B3B] opacity-80">
              Enter your home address or click on the map to choose a location
            </p>
          </div>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative search-container">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                placeholder="Enter your home address..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#fad23c] focus:outline-none focus:ring-2 focus:ring-[#fad23c] text-lg bg-white shadow-lg"
                disabled={!isMapLoaded || unitPriceLoading}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-[9999] max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Search result clicked:', result);
                        handleSearchResultSelect(result);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Search result touched:', result);
                        handleSearchResultSelect(result);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    >
                      <div className="font-medium text-gray-800">{result.display}</div>
                      <div className="text-sm text-gray-500">{result.address}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#fad23c]"></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 items-center">
              <select
                className="px-3 py-3 rounded-2xl border-2 border-[#fad23c] bg-white text-[#463B3B] shadow-lg"
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as TravelModeString)}
                disabled={!isMapLoaded || unitPriceLoading}
              >
                <option value={'DRIVING'}>Driving</option>
                <option value={'WALKING'}>Walking</option>
                <option value={'BICYCLING'}>Bicycling</option>
                <option value={'TRANSIT'}>Transit</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                disabled={!isMapLoaded || !searchQuery.trim() || unitPriceLoading}
                className="bg-gradient-to-r from-[#fad23c] to-[#FFF085] text-[#463B3B] px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </motion.button>
            </div>
          </div>

          {/* Show unit price error if any */}
          {unitPriceError && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-3 inline-block">
                <p className="text-yellow-700 text-sm">{unitPriceError}</p>
              </div>
            </motion.div>
          )}

          {/* Show temporary info when location is selected but not confirmed */}
          {tempCoords && (tempDistance || tempDuration || tempFare) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] border-2 border-[#fad23c] rounded-2xl p-4 shadow-soft-lg inline-block">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-[#D08700] text-lg">📍</span>
                  <span className="text-[#463B3B] font-semibold">Temporary Location</span>
                </div>
                <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
                  {tempDistance && (
                    <p className="text-lg font-semibold text-[#463B3B]">
                      Distance: <span className="text-[#D08700] text-2xl font-bold">{tempDistance}</span>
                    </p>
                  )}
                  {tempDuration && (
                    <p className="text-lg font-semibold text-[#463B3B]">
                      Duration: <span className="text-[#D08700] text-2xl font-bold">{tempDuration}</span>
                    </p>
                  )}
                  {tempFare && (
                    <p className="text-lg font-semibold text-[#463B3B]">
                      Per Trip: <span className="text-[#D08700] text-2xl font-bold">{tempFare}</span>
                      <span className="text-sm text-[#463B3B] opacity-70 ml-2">({unitPrice?.pricePerKm?.toLocaleString('vi-VN') || '7,000'}₫/km)</span>
                    </p>
                  )}
                </div>
                
                {/* Semester Fee Information */}
                {/* {semesterFeeInfo && (
                  <div className="mt-4 p-3 bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] border border-[#fad23c] rounded-xl">
                    <div className="text-center">
                      <h4 className="text-[#463B3B] font-semibold mb-2">📚 Semester Fee Calculation</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[#463B3B] opacity-80 font-medium">Semester:</span>
                          <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).semesterName}</div>
                        </div>
                        <div>
                          <span className="text-[#463B3B] opacity-80 font-medium">Academic Year:</span>
                          <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).academicYear}</div>
                        </div>
                        <div>
                          <span className="text-[#463B3B] opacity-80 font-medium">School Days:</span>
                          <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).totalSchoolDays} days</div>
                        </div>
                        <div>
                          <span className="text-[#463B3B] opacity-80 font-medium">Total Trips:</span>
                          <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).totalTrips} trips</div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-[#fad23c] rounded-lg">
                        <div className="text-[#463B3B] font-bold text-lg">
                          Total Semester Fee: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((semesterFeeInfo as any).totalFee)}
                        </div>
                        <div className="text-[#463B3B] opacity-80 text-sm mt-1">
                          {(semesterFeeInfo as any).totalDistanceKm.toFixed(1)} km total distance
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}
                
                {semesterFeeLoading && (
                  <div className="mt-4 p-3 bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] border border-[#fad23c] rounded-xl text-center">
                    <div className="text-[#463B3B]">🔄 Calculating semester fee...</div>
                  </div>
                )}
                
                {semesterFeeError && (
                  <div className="mt-4 p-3 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl text-center">
                    <div className="text-red-700">⚠️ {semesterFeeError}</div>
                  </div>
                )}
                
                <div className="mt-3 text-sm text-[#463B3B] flex items-center justify-center gap-2">
                  <span className="text-[#D08700]">💡</span>
                  <span>Click vào marker trên bản đồ để xác nhận vị trí này</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Show confirmed info when location is confirmed */}
          {selectedCoords && (distance || duration || fare) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-4 shadow-soft-lg inline-block border border-[#fad23c]">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-[#D08700] text-lg">✅</span>
                  <span className="text-[#463B3B] font-semibold">Confirmed Location</span>
                </div>
                <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
                  {distance && (
                    <p className="text-lg font-semibold text-[#463B3B]">
                      Distance: <span className="text-[#D08700] text-2xl font-bold">{distance}</span>
                    </p>
                  )}
                  {duration && (
                    <p className="text-lg font-semibold text-[#463B3B]">
                      Duration: <span className="text-[#D08700] text-2xl font-bold">{duration}</span>
                    </p>
                  )}
                  {fare && (
                    <p className="text-lg font-semibold text-[#463B3B]">
                      Estimated Fare: <span className="text-[#D08700] text-2xl font-bold">{fare}</span>
                      <span className="text-sm text-[#463B3B] opacity-70 ml-2">({unitPrice?.pricePerKm?.toLocaleString('vi-VN') || '7,000'}₫/km)</span>
                    </p>
                  )}
                </div>
                {fare && (
                  <div className="mt-2 text-sm text-[#463B3B] opacity-80 flex items-center justify-center gap-2">
                    <span className="text-[#D08700]">★</span>
                    <span>Số tiền trên là cho một chuyến đi duy nhất.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Parent email and coordinate display */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-4 shadow-soft border border-[#fad23c]">
              <p className="text-sm text-[#463B3B] opacity-80 mb-1">Parent Email</p>
              <p className="text-[#463B3B] font-semibold break-all">{parentEmail || '—'}</p>
            </div>
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-4 shadow-soft border border-[#fad23c]">
              <p className="text-sm text-[#463B3B] opacity-80 mb-1">Selected Coordinates</p>
              {selectedCoords ? (
                <p className="text-[#463B3B] font-semibold">Lat: {selectedCoords.lat.toFixed(6)} — Lng: {selectedCoords.lng.toFixed(6)}</p>
              ) : tempCoords ? (
                <p className="text-[#D08700] font-semibold">Lat: {tempCoords.lat.toFixed(6)} — Lng: {tempCoords.lng.toFixed(6)} <span className="text-sm text-[#463B3B] opacity-70">(temporary)</span></p>
              ) : (
                <p className="text-[#463B3B] opacity-70">Click on the map to select a location</p>
              )}
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className="bg-red-100 border border-red-300 rounded-2xl p-4 inline-block">
                <p className="text-red-600">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Submit Request Section - Only Show When Location Is Confirmed */}
          {selectedCoords && students.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-6 shadow-soft-lg border border-[#fad23c]">
                <h3 className="text-lg font-semibold text-[#463B3B] mb-4">Submit Pickup Point Request</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[#463B3B] opacity-80">Parent Email:</span>
                    <span className="font-semibold text-[#463B3B]">{parentEmail}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#463B3B] opacity-80">Location:</span>
                    <span className="font-semibold text-[#463B3B]">{searchQuery || 'Map location'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#463B3B] opacity-80">Coordinates:</span>
                    <span className="font-semibold text-[#463B3B] text-sm">
                      {selectedCoords?.lat.toFixed(6)}, {selectedCoords?.lng.toFixed(6)}
                    </span>
                  </div>
                  
                  {distance && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#463B3B] opacity-80">Distance:</span>
                      <span className="font-semibold text-[#463B3B]">{distance}</span>
                    </div>
                  )}
                  
                  {duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#463B3B] opacity-80">Duration:</span>
                      <span className="font-semibold text-[#463B3B]">{duration}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <span className="text-[#463B3B] opacity-80">Students:</span>
                    <div className="text-right">
                      <span className="font-semibold text-[#463B3B]">{students.length} student(s)</span>
                      {students.length > 0 && (
                        <div className="mt-1 text-sm text-[#463B3B] opacity-80">
                          {students.map((s, idx) => (
                            <div key={s.id || idx}>
                              • {s.fullName || s.name || 'Student'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-[#fad23c] pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#463B3B] opacity-80">Unit Price:</span>
                      <span className="font-semibold text-[#463B3B]">
                        {unitPrice?.pricePerKm?.toLocaleString('vi-VN') || '7,000'}₫/km
                      </span>
                    </div>
                    
                    {fare && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[#463B3B] opacity-80 font-semibold">Per Trip Cost:</span>
                        <span className="font-bold text-[#D08700] text-lg">{fare}</span>
                      </div>
                    )}
                    
                    {/* Semester Fee Information */}
                    {/* {semesterFeeInfo && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] border border-[#fad23c] rounded-xl">
                        <h4 className="text-[#463B3B] font-semibold mb-3 text-center">📚 Semester Fee Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-[#463B3B] opacity-80 font-medium">Semester:</span>
                            <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).semesterName}</div>
                          </div>
                          <div>
                            <span className="text-[#463B3B] opacity-80 font-medium">Academic Year:</span>
                            <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).academicYear}</div>
                          </div>
                          <div>
                            <span className="text-[#463B3B] opacity-80 font-medium">School Days:</span>
                            <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).totalSchoolDays} days</div>
                          </div>
                          <div>
                            <span className="text-[#463B3B] opacity-80 font-medium">Total Trips:</span>
                            <div className="text-[#463B3B] font-semibold">{(semesterFeeInfo as any).totalTrips} trips</div>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-[#fad23c] rounded-lg text-center">
                          <div className="text-[#463B3B] font-bold text-xl">
                            Total Semester Fee: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((semesterFeeInfo as any).totalFee)}
                          </div>
                          <div className="text-[#463B3B] opacity-80 text-sm mt-1">
                            {(semesterFeeInfo as any).totalDistanceKm.toFixed(1)} km total distance
                          </div>
                          <div className="text-[#463B3B] opacity-70 text-xs mt-2">
                            💡 This is the amount you&apos;ll pay for the entire semester
                          </div>
                        </div>
                      </div>
                    )} */}
                    
                    {semesterFeeLoading && (
                      <div className="mt-4 p-3 bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] border border-[#fad23c] rounded-xl text-center">
                        <div className="text-[#463B3B]">🔄 Calculating semester fee...</div>
                      </div>
                    )}
                    
                    {semesterFeeError && (
                      <div className="mt-4 p-3 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl text-center">
                        <div className="text-red-700">⚠️ {semesterFeeError}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {submitError && (
                  <div className="bg-red-100 border border-red-300 rounded-2xl p-3 mb-4">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}
                
                {submitSuccess && (
                  <div className="bg-green-100 border border-green-300 rounded-2xl p-3 mb-4">
                    <p className="text-green-600 text-sm">{submitSuccess}</p>
                    <p className="text-green-600 text-xs mt-1">Redirecting to home page...</p>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#fad23c] to-[#FFF085] text-[#463B3B] px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Map Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative h-[400px] w-full"
      >
        {/* Students list (right top below buttons on desktop, above map on mobile) */}
        {!showSubmitForm && parentEmail && (
          <div className="absolute left-4 top-4 z-20 max-w-[360px]">
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] backdrop-blur rounded-2xl shadow-lg p-4 border border-[#fad23c]">
              <p className="text-sm text-[#463B3B] opacity-80">Students Linked To</p>
              <p className="text-sm font-semibold text-[#463B3B] break-all mb-2">{parentEmail}</p>
              {false ? (
                <p className="text-[#463B3B] opacity-70 text-sm">Loading Students...</p>
              ) : studentsError ? (
                <p className="text-red-600 text-sm">{studentsError}</p>
              ) : students.length === 0 ? (
                <p className="text-[#463B3B] opacity-70 text-sm">No Students Found.</p>
              ) : (
                <ul className="text-sm text-[#463B3B] space-y-1 max-h-40 overflow-auto pr-1">
                  {students.map((s, idx) => (
                    <li key={s.id || idx} className="flex items-center gap-2">
                      <span className="text-[#D08700]">•</span>
                      <span>{s.fullName || s.name || 'Student'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {/* Map action buttons */}
        {!showSubmitForm && (
          <div className="absolute z-20 right-4 top-4 flex flex-col gap-2">
          <button
            onClick={() => {
              if (!mapInstanceRef.current) return;
              // Center on school for VietMap
              console.log('Center on school');
            }}
            className="bg-gradient-to-r from-[#FEFCE8] to-[#FFF085] hover:from-[#FFF085] hover:to-[#fad23c] text-[#463B3B] px-4 py-2 rounded-xl shadow-lg border border-[#fad23c] transition-all duration-300"
          >
            Center on School
          </button>
          <button
            onClick={() => {
              if (!mapInstanceRef.current) return;
              // Fit route for VietMap
              console.log('Fit route');
            }}
            className="bg-gradient-to-r from-[#FEFCE8] to-[#FFF085] hover:from-[#FFF085] hover:to-[#fad23c] text-[#463B3B] px-4 py-2 rounded-xl shadow-lg border border-[#fad23c] transition-all duration-300"
          >
            Fit Route
          </button>
          <button
            onClick={() => {
              if (markerRef.current) {
                markerRef.current = null;
              }
              setDistance('');
              setDuration('');
              setFare('');
              setTempDistance('');
              setTempDuration('');
              setTempFare('');
              setSelectedCoords(null);
              setTempCoords(null);
              setShowConfirmModal(false);
              setShowSubmitForm(false);
              setError('');
            }}
            className="bg-gradient-to-r from-[#FEFCE8] to-[#FFF085] hover:from-[#FFF085] hover:to-[#fad23c] text-[#463B3B] px-4 py-2 rounded-xl shadow-lg border border-[#fad23c] transition-all duration-300"
          >
            Clear Location
          </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fad23c] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Map...</p>
            </div>
          </div>
        )}

        {/* Only show overlay for map load errors, not normal search errors */}
        {error && !isLoading && !isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Map</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="bg-white rounded-2xl p-4 text-left">
                <h4 className="font-semibold text-gray-800 mb-2">How to Fix:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check API key in .env.local</li>
                  <li>• Enable billing in Google Cloud Console</li>
                  <li>• Activate Maps JavaScript API</li>
                  <li>• Check network connection</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {!showSubmitForm && (
          <div className="w-full h-full">
            <VietMapPageComponent
              onMapReady={handleMapReady}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              selectedCoords={selectedCoords}
              tempCoords={tempCoords}
              isRouting={isRouting}
              travelMode={travelMode}
              isLoading={isLoading}
              error={error}
              isMapLoaded={isMapLoaded}
              setIsMapLoaded={setIsMapLoaded}
              setError={setError}
              setIsLoading={setIsLoading}
              setIsRouting={setIsRouting}
              onRouteCalculated={handleRouteCalculated}
              unitPrice={unitPrice?.pricePerKm || 7000}
            />
          </div>
        )}
      </motion.div>

      {/* Instructions */}
      {!showSubmitForm && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] px-6 py-8"
        >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#463B3B] mb-4">How to use</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-6 border border-[#fad23c] shadow-lg">
              <div className="w-12 h-12 bg-[#fad23c] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-[#463B3B] mb-2">Search Address</h3>
              <p className="text-[#463B3B] opacity-80 text-sm">Enter your home address in the search box</p>
            </div>
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-6 border border-[#fad23c] shadow-lg">
              <div className="w-12 h-12 bg-[#fad23c] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold text-[#463B3B] mb-2">Click on the Map</h3>
              <p className="text-[#463B3B] opacity-80 text-sm">Click your home location on the map to preview</p>
            </div>
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-6 border border-[#fad23c] shadow-lg">
              <div className="w-12 h-12 bg-[#fad23c] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-[#463B3B] mb-2">Confirm Location</h3>
              <p className="text-[#463B3B] opacity-80 text-sm">Click the marker to confirm your choice</p>
            </div>
          </div>
        </div>
        </motion.div>
      )}
    </div>
  );
}