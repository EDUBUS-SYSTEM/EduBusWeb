'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader } from '@googlemaps/js-api-loader';
import { pickupPointService } from '@/services/pickupPointService';

type Student = {
  id?: string | number;
  fullName?: string;
  name?: string;
};

const SCHOOL_LOCATION = {
  lat: 15.9796,
  lng: 108.2605
};

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const schoolMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
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
  
  // Submit request state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // FPT School Đà Nẵng - Khu A3-1, Khu đô thị Công nghệ FPT, phường Hòa Hải, quận Ngũ Hành Sơn
  const schoolLocation = SCHOOL_LOCATION;

  // Distance will be calculated from Directions result (driving distance)

  // Memoized route drawing
  const drawRoute = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, options?: { fitBounds?: boolean }) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;
    if (!(globalThis as { google?: typeof google }).google) return;
    if (isRouting) return;
    setIsRouting(true);

    directionsServiceRef.current.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: (travelMode as unknown) as google.maps.TravelMode,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        setIsRouting(false);
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);
          const route = result.routes?.[0];
          if (route && route.legs && route.legs.length > 0) {
            const totalMeters = route.legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
            const totalSeconds = route.legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);
            const distanceKm = (totalMeters / 1000).toFixed(2);
            const minutes = Math.round(totalSeconds / 60);
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            setDistance(`${distanceKm} km`);
            setDuration(hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`);

            // Calculate fare at 7,000 VND per km
            const fareNumber = (totalMeters / 1000) * 7000;
            const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));
            setFare(formattedFare);

            // Optionally fit bounds to route only when requested
            if (mapInstanceRef.current && options?.fitBounds) {
              const bounds = new google.maps.LatLngBounds();
              route.legs.forEach(leg => {
                if (leg.start_location) bounds.extend(leg.start_location);
                if (leg.end_location) bounds.extend(leg.end_location);
                leg.steps?.forEach(step => {
                  if (step.path) step.path.forEach(p => bounds.extend(p));
                });
              });
              mapInstanceRef.current.fitBounds(bounds, 64);
            }
          } else {
            setDistance('');
            setDuration('');
            setFare('');
          }
        } else {
          // Improve error feedback by status
          const statusMessageMap: Record<string, string> = {
            [google.maps.DirectionsStatus.ZERO_RESULTS]: 'No route found.',
            [google.maps.DirectionsStatus.NOT_FOUND]: 'One of the locations could not be found.',
            [google.maps.DirectionsStatus.OVER_QUERY_LIMIT]: 'Query limit exceeded. Please try again later.',
            [google.maps.DirectionsStatus.REQUEST_DENIED]: 'Request denied (check API key/permissions).',
            [google.maps.DirectionsStatus.INVALID_REQUEST]: 'Invalid request.',
            [google.maps.DirectionsStatus.UNKNOWN_ERROR]: 'Unknown error, please try again.',
          };
          setError(statusMessageMap[status] || 'Unable to calculate route.');
          setDistance('');
          setDuration('');
          setFare('');
        }
      }
    );
  }, [travelMode, isRouting]);

  // Create home marker
  const createHomeMarker = useCallback((lat: number, lng: number, map: google.maps.Map) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: 'Your Home',
      icon: {
        url: '/edubus_logo.png',
        scaledSize: new google.maps.Size(35, 35),
        anchor: new google.maps.Point(17.5, 17.5)
      },
      draggable: true
    });

    // Add drag listener
    markerRef.current.addListener('dragend', () => {
      const newPosition = markerRef.current?.getPosition();
      if (newPosition) {
        const newLat = newPosition.lat();
        const newLng = newPosition.lng();
        setSelectedCoords({ lat: newLat, lng: newLng });
        drawRoute(schoolLocation, { lat: newLat, lng: newLng });
      }
    });

    // Draw route (driving) and update distance/duration from Directions result
    setSelectedCoords({ lat, lng });
    drawRoute(schoolLocation, { lat, lng });
  }, [drawRoute, schoolLocation]);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        // Check if API key is properly configured
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          setError('API key is not configured. Please check .env.local');
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry'],
          language: 'vi',
          region: 'VN'
        });

        const { Map } = await loader.importLibrary('maps');
        const { Marker } = await loader.importLibrary('marker');
        const { DirectionsService, DirectionsRenderer } = await loader.importLibrary('routes');

        if (!isMounted || !mapRef.current) return;

        // Initialize map with optimized settings
        const map = new Map(mapRef.current, {
          center: schoolLocation,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          gestureHandling: 'greedy',
          clickableIcons: false
        });

        mapInstanceRef.current = map;
        map.setOptions({
          scrollwheel: true,
          disableDoubleClickZoom: false,
          keyboardShortcuts: true,
          gestureHandling: 'greedy'
        });

        // Initialize services
        directionsServiceRef.current = new DirectionsService();
        directionsRendererRef.current = new DirectionsRenderer({
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: {
            strokeColor: '#FDC700',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });
        directionsRendererRef.current.setMap(map);

        // Create school marker with custom icon
        schoolMarkerRef.current = new Marker({
          position: schoolLocation,
          map: map,
          title: 'FPT Primary & Secondary School Da Nang',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="50" height="65" viewBox="0 0 50 65" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
                  </filter>
                </defs>
                <!-- School building -->
                <rect x="10" y="20" width="30" height="20" fill="#FDC700" stroke="#D08700" stroke-width="1.5" filter="url(#shadow)"/>
                <rect x="15" y="25" width="4" height="4" fill="#D08700"/>
                <rect x="21" y="25" width="4" height="4" fill="#D08700"/>
                <rect x="27" y="25" width="4" height="4" fill="#D08700"/>
                <rect x="15" y="31" width="4" height="4" fill="#D08700"/>
                <rect x="21" y="31" width="4" height="4" fill="#D08700"/>
                <rect x="27" y="31" width="4" height="4" fill="#D08700"/>
                <!-- Roof -->
                <polygon points="10,20 25,8 40,20" fill="#D08700" filter="url(#shadow)"/>
                <!-- Flag -->
                <rect x="23" y="8" width="2" height="12" fill="#8B4513"/>
                <rect x="25" y="8" width="6" height="4" fill="#FF0000"/>
                <!-- Marker pin -->
                <circle cx="25" cy="55" r="6" fill="#FDC700" stroke="#D08700" stroke-width="1.5" filter="url(#shadow)"/>
                <circle cx="25" cy="55" r="3" fill="#D08700"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50)
          }
        });

        // Add school info window
        const schoolInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; text-align: center; font-family: Arial, sans-serif; max-width: 200px;">
              <div style="font-weight: bold; color: #D08700; font-size: 14px; margin-bottom: 5px;">
                🏫 FPT Primary & Secondary School Da Nang
              </div>
              <div style="font-size: 11px; color: #666; line-height: 1.4;">
                A3-1, FPT City<br>
                Hoa Hai Ward, Ngu Hanh Son District<br>
                Da Nang 550000
              </div>
            </div>
          `,
          position: schoolLocation
        });

        // Show info window on school marker click
        schoolMarkerRef.current.addListener('click', () => {
          schoolInfoWindow.open(map, schoolMarkerRef.current);
        });

        // Add click listener to map
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            setSelectedCoords({ lat, lng });
            createHomeMarker(lat, lng, map);
          }
        });

        setIsMapLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        
        // Check for specific billing error
        if (error instanceof Error && error.message.includes('BillingNotEnabledMapError')) {
          setError('Billing is not enabled. Please enable billing in Google Cloud Console.');
        } else if (error instanceof Error && error.message.includes('ApiNotActivatedMapError')) {
          setError('Google Maps API is not activated. Please enable Maps JavaScript API in Google Cloud Console.');
        } else {
          setError('Unable to load the map. Please check your network and API key.');
        }
        
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [createHomeMarker, schoolLocation]);

  // Initialize Places Autocomplete on the input
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !window.google?.maps?.places) return;
    if (!inputRef.current) return;

    try {
      const options: google.maps.places.AutocompleteOptions = {
        fields: ['geometry', 'formatted_address', 'name'],
        componentRestrictions: { country: ['vn'] },
      };
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, options);
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        const location = place?.geometry?.location;
        if (location && mapInstanceRef.current) {
          const lat = location.lat();
          const lng = location.lng();
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
          setSelectedCoords({ lat, lng });
          createHomeMarker(lat, lng, mapInstanceRef.current);
        }
      });
    } catch {
      // Autocomplete optional; ignore failures
    }

    return () => {
      // No direct remove API for Autocomplete listeners; rely on GC
      autocompleteRef.current = null;
    };
  }, [isMapLoaded, createHomeMarker]);

  // Handle manual search (fallback if user presses button)
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current || !isMapLoaded) return;

    setError('');
    try {
      const geocoder = new google.maps.Geocoder();
      const bounds = mapInstanceRef.current.getBounds?.();
      geocoder.geocode({ address: searchQuery, bounds, region: 'VN' }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Center map on searched location
          mapInstanceRef.current?.setCenter({ lat, lng });
          mapInstanceRef.current?.setZoom(15);

          // Create home marker and draw route
          if (mapInstanceRef.current) {
            setSelectedCoords({ lat, lng });
            createHomeMarker(lat, lng, mapInstanceRef.current);
          }
        } else {
          // Fallback to Places text search if Geocoder doesn't find the address
          try {
            const service = new google.maps.places.PlacesService(mapInstanceRef.current as google.maps.Map);
            service.textSearch({ query: searchQuery, region: 'VN' }, (placesResults, placesStatus) => {
              if (
                placesStatus === google.maps.places.PlacesServiceStatus.OK &&
                placesResults &&
                placesResults[0]?.geometry?.location
              ) {
                const loc = placesResults[0].geometry.location;
                const lat = loc.lat();
                const lng = loc.lng();
                mapInstanceRef.current?.setCenter({ lat, lng });
                mapInstanceRef.current?.setZoom(15);
                if (mapInstanceRef.current) {
                  setSelectedCoords({ lat, lng });
                  createHomeMarker(lat, lng, mapInstanceRef.current);
                }
              } else {
                setError('Address not found. Please try a different address.');
              }
            });
          } catch {
            setError('Address not found. Please try a different address.');
          }
        }
      });
    } catch (error) {
      console.error('Error searching address:', error);
      setError('An error occurred while searching for the address.');
    }
  }, [searchQuery, isMapLoaded, createHomeMarker]);

  // Recalculate route when travel mode changes (if home marker exists)
  useEffect(() => {
    if (!isMapLoaded) return;
    const position = markerRef.current?.getPosition?.();
    if (position) {
      drawRoute(schoolLocation, { lat: position.lat(), lng: position.lng() });
    }
  }, [travelMode, isMapLoaded, drawRoute, schoolLocation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Submit pickup point request
  const handleSubmitRequest = async () => {
    if (!selectedCoords || !parentEmail || students.length === 0) {
      setSubmitError('Please select a location and ensure students are loaded.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const distanceKm = parseFloat(distance.replace(' km', '')) || 0;
      const estimatedPrice = parseFloat(fare.replace(/[^\d]/g, '')) || 0;

      const payload = {
        email: parentEmail,
        studentIds: students.map(s => s.id?.toString() || ''),
        addressText: searchQuery || 'Selected location',
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        distanceKm: distanceKm,
        description: `Pickup point request for ${students.length} student(s)`,
        reason: 'Parent requested pickup point service',
        unitPriceVndPerKm: 7000,
        estimatedPriceVnd: estimatedPrice
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

  // Load parent email from previous step
  useEffect(() => {
    try {
      const email = sessionStorage.getItem('parentEmail') || '';
      setParentEmail(email);
    } catch {}
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
      setStudentsError('Unable to load students data.');
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
        className="flex items-center justify-between px-6 py-4 bg-[#FEFCE8] shadow-soft"
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
          <span className="text-2xl font-bold text-[#D08700]">EduBus - Find route</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="bg-[#FDC700] text-black px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Back to Home
        </motion.button>
      </motion.header>

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#FEFCE8] px-6 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Find distance from home to school
            </h1>
            <p className="text-gray-600">
              Enter your home address or click on the map to choose a location
            </p>
          </div>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your home address..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg"
                disabled={!isMapLoaded}
              />
            </div>
            <div className="flex gap-3 items-center">
              <select
                className="px-3 py-3 rounded-2xl border-2 border-[#FDC700] bg-white text-gray-800"
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as TravelModeString)}
                disabled={!isMapLoaded}
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
                disabled={!isMapLoaded || !searchQuery.trim()}
                className="bg-[#FDC700] text-black px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </motion.button>
            </div>
          </div>

          {(distance || duration || fare) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="bg-white rounded-2xl p-4 shadow-soft-lg inline-block">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
                  {distance && (
                    <p className="text-lg font-semibold text-gray-800">
                      Distance: <span className="text-[#D08700] text-2xl font-bold">{distance}</span>
                    </p>
                  )}
                  {duration && (
                    <p className="text-lg font-semibold text-gray-800">
                      Duration: <span className="text-[#D08700] text-2xl font-bold">{duration}</span>
                    </p>
                  )}
                  {fare && (
                    <p className="text-lg font-semibold text-gray-800">
                      Estimated Fare: <span className="text-[#D08700] text-2xl font-bold">{fare}</span>
                      <span className="text-sm text-gray-500 ml-2">(7.000₫/km)</span>
                    </p>
                  )}
                </div>
                {fare && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-2">
                    <span className="text-[#D08700]">★</span>
                    <span>Số tiền trên là cho một chuyến đi duy nhất.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Parent email and coordinate display */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <p className="text-sm text-gray-500 mb-1">Parent email</p>
              <p className="text-gray-800 font-semibold break-all">{parentEmail || '—'}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <p className="text-sm text-gray-500 mb-1">Selected coordinates</p>
              {selectedCoords ? (
                <p className="text-gray-800 font-semibold">Lat: {selectedCoords.lat.toFixed(6)} — Lng: {selectedCoords.lng.toFixed(6)}</p>
              ) : (
                <p className="text-gray-500">Click on the map to select a location</p>
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

          {/* Submit Request Section */}
          {selectedCoords && students.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="bg-white rounded-2xl p-6 shadow-soft-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Pickup Point Request</h3>
                <p className="text-gray-600 mb-4">
                  Location selected: <span className="font-semibold">{searchQuery || 'Map location'}</span>
                </p>
                <p className="text-gray-600 mb-4">
                  Students: <span className="font-semibold">{students.length} student(s)</span>
                </p>
                {fare && (
                  <p className="text-gray-600 mb-4">
                    Estimated cost: <span className="font-semibold text-[#D08700]">{fare}</span>
                  </p>
                )}
                
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
                  className="bg-[#FDC700] text-black px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="relative h-[600px] w-full"
      >
        {/* Students list (right top below buttons on desktop, above map on mobile) */}
        {parentEmail && (
          <div className="absolute left-4 top-4 z-20 max-w-[360px]">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow p-4">
              <p className="text-sm text-gray-500">Students linked to</p>
              <p className="text-sm font-semibold text-gray-800 break-all mb-2">{parentEmail}</p>
              {false ? (
                <p className="text-gray-500 text-sm">Loading students...</p>
              ) : studentsError ? (
                <p className="text-red-600 text-sm">{studentsError}</p>
              ) : students.length === 0 ? (
                <p className="text-gray-500 text-sm">No students found.</p>
              ) : (
                <ul className="text-sm text-gray-800 space-y-1 max-h-40 overflow-auto pr-1">
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
        <div className="absolute z-20 right-4 top-4 flex flex-col gap-2">
          <button
            onClick={() => {
              if (!mapInstanceRef.current) return;
              mapInstanceRef.current.setCenter(schoolLocation);
              mapInstanceRef.current.setZoom(14);
            }}
            className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl shadow"
          >
            Center on school
          </button>
          <button
            onClick={() => {
              if (!directionsRendererRef.current || !mapInstanceRef.current) return;
              const directions = directionsRendererRef.current.getDirections();
              const route = directions?.routes?.[0];
              if (!route) return;
              const bounds = new google.maps.LatLngBounds();
              route.legs.forEach(leg => {
                if (leg.start_location) bounds.extend(leg.start_location);
                if (leg.end_location) bounds.extend(leg.end_location);
                leg.steps?.forEach(step => step.path?.forEach(p => bounds.extend(p)));
              });
              mapInstanceRef.current.fitBounds(bounds, 64);
            }}
            className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl shadow"
          >
            Fit route
          </button>
          <button
            onClick={() => {
              if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
              }
              if (directionsRendererRef.current) {
                directionsRendererRef.current.setDirections(null);
              }
              setDistance('');
              setDuration('');
              setFare('');
              setError('');
            }}
            className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl shadow"
          >
            Clear home
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC700] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to load map</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="bg-white rounded-2xl p-4 text-left">
                <h4 className="font-semibold text-gray-800 mb-2">How to fix:</h4>
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
        
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '600px' }}
        />
      </motion.div>

      {/* Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white px-6 py-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How to use</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#FEFCE8] rounded-2xl p-6">
              <div className="w-12 h-12 bg-[#FDC700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Search address</h3>
              <p className="text-gray-600 text-sm">Enter your home address in the search box</p>
            </div>
            <div className="bg-[#FEFCE8] rounded-2xl p-6">
              <div className="w-12 h-12 bg-[#FDC700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Click on the map</h3>
              <p className="text-gray-600 text-sm">Click your home location on the map</p>
            </div>
            <div className="bg-[#FEFCE8] rounded-2xl p-6">
              <div className="w-12 h-12 bg-[#FDC700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📏</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">See distance</h3>
              <p className="text-gray-600 text-sm">Distance will be shown automatically</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}