'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaTimes, FaMapMarkerAlt, FaCheck, FaSpinner, FaSearch } from 'react-icons/fa';
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { SchoolLocationRequest } from '@/services/schoolService/schoolService.types';
import { vietmapService, VietMapAutocompleteResult } from '@/services/vietmapService';

interface SchoolMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: { lat: number; lng: number };
  onLocationSelect: (location: SchoolLocationRequest) => void;
}

const SchoolMapPicker: React.FC<SchoolMapPickerProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const markerRef = useRef<vietmapgl.Marker | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    currentLocation || null
  );
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<VietMapAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Search for locations
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Cancel previous search
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    try {
      setIsSearching(true);
      const results = await vietmapService.autocomplete(
        query,
        selectedLocation || currentLocation,
        abortController.signal
      );
      
      if (!abortController.signal.aborted) {
        setSearchResults(results);
        setShowSearchResults(true);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error searching locations:', err);
      setSearchResults([]);
    } finally {
      if (!abortController.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [selectedLocation, currentLocation]);

  // Handle search input change with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSearchResults && !target.closest('.search-container')) {
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

  // Geocode coordinates to get address
  const geocodeLocation = useCallback(async (lat: number, lng: number, signal?: AbortSignal) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setAddress('');
        return;
      }

      // Use vietmapService for reverse geocoding
      const address = await vietmapService.reverseGeocode(lat, lng, signal);
      if (!signal?.aborted) {
        setAddress(address);
      }
    } catch (err) {
      // Ignore abort errors - they're expected when component unmounts
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error geocoding location:', err);
      if (!signal?.aborted) {
        setAddress('');
      }
    }
  }, []);

  // Add marker to map
  const addMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create marker element
    const markerElement = document.createElement('div');
    markerElement.innerHTML = '🏫';
    markerElement.style.fontSize = '32px';
    markerElement.style.textAlign = 'center';
    markerElement.style.lineHeight = '1';
    markerElement.style.cursor = 'pointer';

    // Create marker
    const marker = new vietmapgl.Marker({
      element: markerElement,
      anchor: 'center',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(mapInstanceRef.current);

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLngLat();
      const newLat = position.lat;
      const newLng = position.lng;
      setSelectedLocation({ lat: newLat, lng: newLng });
      if (abortControllerRef.current) {
        geocodeLocation(newLat, newLng, abortControllerRef.current.signal);
      }
    });

    // Add popup
    const popup = new vietmapgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">School Location</h3>
          <p class="text-xs text-gray-600">Lat: ${lat.toFixed(6)}</p>
          <p class="text-xs text-gray-600">Lng: ${lng.toFixed(6)}</p>
          <p class="text-xs text-gray-500 mt-1">Drag to adjust</p>
        </div>
      `);

    marker.setPopup(popup);
    markerRef.current = marker;
    setSelectedLocation({ lat, lng });

    // Center map on marker
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [geocodeLocation]);

  // Handle search result selection
  const handleSelectSearchResult = useCallback(async (result: VietMapAutocompleteResult) => {
    try {
      setIsSearching(true);
      
      // Try to get coordinates from place details API
      let coords = await vietmapService.getPlaceDetails(result.ref_id);
      
      // Fallback: If place details fails, try Nominatim geocoding
      if (!coords) {
        const searchText = result.display || result.address || result.name;
        if (searchText) {
          console.log('Place details failed, trying Nominatim geocoding for:', searchText);
          coords = await vietmapService.geocodeWithNominatim(searchText);
        }
      }
      
      if (coords) {
        addMarker(coords.lat, coords.lng);
        setAddress(result.display || result.address || result.name);
        setSearchQuery(result.display || result.address || result.name);
        setShowSearchResults(false);
      } else {
        console.warn('Could not get coordinates for selected location');
        // Still update the address even if we can't get coordinates
        setAddress(result.display || result.address || result.name);
        setSearchQuery(result.display || result.address || result.name);
        setShowSearchResults(false);
      }
    } catch (err) {
      console.error('Error getting place details:', err);
      // Still update the address on error
      setAddress(result.display || result.address || result.name);
      setSearchQuery(result.display || result.address || result.name);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [addMarker]);

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    let isMounted = true;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          if (isMounted) {
            setError('VietMap API key not configured');
          }
          return;
        }

        if (!isMounted || !mapRef.current) return;

        // Default center (Da Nang)
        const defaultCenter: [number, number] = currentLocation
          ? [currentLocation.lng, currentLocation.lat]
          : [108.2605, 15.9796];

        // Initialize map
        const map = new vietmapgl.Map({
          container: mapRef.current,
          style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
          center: defaultCenter,
          zoom: currentLocation ? 15 : 13
        });

        mapInstanceRef.current = map;

        // Add navigation controls
        map.addControl(new vietmapgl.NavigationControl(), 'top-right');

        // Handle map load
        map.on('load', () => {
          if (!isMounted) return;
          setIsMapLoaded(true);
          setError('');

          // Add initial marker if location exists
          if (currentLocation) {
            addMarker(currentLocation.lat, currentLocation.lng);
            geocodeLocation(currentLocation.lat, currentLocation.lng, abortController.signal);
            setSelectedLocation(currentLocation);
          }
        });

        // Handle map click
        map.on('click', (e) => {
          if (!isMounted) return;
          setShowSearchResults(false);
          const { lng, lat } = e.lngLat;
          addMarker(lat, lng);
          geocodeLocation(lat, lng, abortController.signal);
        });

        // Handle errors
        map.on('error', (e) => {
          console.error('Map error:', e);
          if (isMounted) {
            setError('Map loading error. Please refresh the page.');
          }
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMounted) {
          setError('Failed to initialize map. Please check your API key.');
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      
      // Abort any pending geocoding requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Abort any pending search requests
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
        searchAbortControllerRef.current = null;
      }
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn('Error removing map:', err);
        }
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch (err) {
          console.warn('Error removing marker:', err);
        }
        markerRef.current = null;
      }
      setIsMapLoaded(false);
      setError('');
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    };
  }, [isOpen, currentLocation, geocodeLocation, addMarker]);

  const handleConfirm = async () => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    setIsLoading(true);
    try {
      await onLocationSelect({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        fullAddress: address || undefined,
        displayAddress: address || undefined
      });
    } catch (err) {
      console.error('Error confirming location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            Select School Location
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
                {error}
              </div>
            )}
            
            {/* Search Box */}
            <div className="absolute top-4 left-4 right-4 z-20 max-w-md">
              <div className="relative search-container">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    placeholder="Tìm kiếm địa điểm..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent bg-white"
                  />
                  {isSearching && (
                    <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-30">
                    {searchResults.map((result, index) => (
                      <button
                        key={result.ref_id || index}
                        onClick={() => handleSelectSearchResult(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-[#fad23c] mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{result.name}</p>
                            <p className="text-sm text-gray-600 truncate">{result.display || result.address}</p>
                            {result.boundaries && result.boundaries.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {result.boundaries.map(b => b.name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div ref={mapRef} className="w-full h-full" />
            {!isMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <FaSpinner className="w-8 h-8 animate-spin text-[#fad23c] mx-auto mb-2" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="w-96 border-l bg-gray-50 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Location Details
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click on the map or drag the marker to select the school location.
                </p>
              </div>

              {selectedLocation && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      value={selectedLocation.lat.toFixed(6)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      value={selectedLocation.lng.toFixed(6)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address will be auto-detected or enter manually"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {!selectedLocation && (
                <div className="text-center py-8 text-gray-500">
                  <FaMapMarkerAlt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Click on the map to select a location</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleConfirm}
                  disabled={!selectedLocation || isLoading}
                  className="w-full px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4" />
                      Confirm Location
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolMapPicker;

