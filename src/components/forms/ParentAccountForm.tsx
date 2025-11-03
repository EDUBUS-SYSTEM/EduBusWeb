"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ParentAccountData, AccountFormErrors } from "@/types";
import { studentService } from "@/services/studentService/studentService.api";
import { StudentDto } from "@/services/studentService/studentService.types";
import { unitPriceService, UnitPriceResponseDto } from "@/services/unitPriceService";
import { vietmapService, VietMapGeocodeResult } from "@/services/vietmapService";
import VietMapPageComponent from "@/components/VietMapPageComponent";

interface ParentAccountFormProps {
  onSubmit: (data: ParentAccountData & PickupPointData) => void;
  loading?: boolean;
  errors?: AccountFormErrors;
  key?: string | number;
}

interface PickupPointData {
  selectedStudents: StudentDto[];
  pickupPoint: {
    addressText: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
  } | null;
  feeCalculation: {
    perTripFee: number;
    semesterFee: number;
    totalSchoolDays: number;
    totalTrips: number;
  } | null;
}

const SCHOOL_LOCATION = {
  lat: 15.9796,
  lng: 108.2605
};

const ParentAccountForm: React.FC<ParentAccountFormProps> = ({
  onSubmit,
  loading = false,
  errors = {},
}) => {
  // Basic parent info
  const [formData, setFormData] = useState<ParentAccountData>({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    studentIds: [],
    students: [],
  });

  // Student selection
  const [unassignedStudents, setUnassignedStudents] = useState<StudentDto[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentDto[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  // Map and pickup point
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VietMapGeocodeResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState("");

  // Fee calculation
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [perTripFee, setPerTripFee] = useState<number>(0);
  const [semesterFee, setSemesterFee] = useState<number>(0);
  const [totalSchoolDays, setTotalSchoolDays] = useState<number>(0);
  const [totalTrips, setTotalTrips] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<UnitPriceResponseDto | null>(null);
  const [feeCalculating, setFeeCalculating] = useState(false);

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  // Load unassigned students
  useEffect(() => {
    const loadUnassignedStudents = async () => {
      try {
        setStudentsLoading(true);
        setStudentsError("");
        const students = await studentService.getUnassigned();
        setUnassignedStudents(students);
      } catch (error) {
        console.error("Error loading unassigned students:", error);
        setStudentsError("Failed to load students. Please refresh the page.");
      } finally {
        setStudentsLoading(false);
      }
    };

    loadUnassignedStudents();
  }, []);

  // Load unit price
  useEffect(() => {
    const loadUnitPrice = async () => {
      try {
        const price = await unitPriceService.getCurrentEffective();
        setUnitPrice(price);
      } catch (error) {
        console.error("Error loading unit price:", error);
      }
    };

    loadUnitPrice();
  }, []);

  const handleInputChange = (field: keyof ParentAccountData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleStudentSelection = (student: StudentDto) => {
    setSelectedStudents((prev) => {
      const exists = prev.find(s => s.id === student.id);
      if (exists) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleSearchInputChange = useCallback(async (value: string) => {
    setSearchQuery(value);

    if (value.trim().length >= 2) {
      try {
        const results = await vietmapService.autocomplete(value, SCHOOL_LOCATION);
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
      } catch (error) {
        console.error("Error with autocomplete:", error);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, []);

  const handleSearchResultSelect = useCallback(async (result: VietMapGeocodeResult) => {
    setShowSearchResults(false);
    setMapError("");

    let coords = null;
    if (result.ref_id) {
      try {
        coords = await vietmapService.getPlaceDetails(result.ref_id);
      } catch (error) {
        console.error("Error getting coordinates:", error);
      }
    }

    if (!coords) {
      try {
        coords = await vietmapService.geocodeWithNominatim(result.display);
      } catch (error) {
        console.error("Nominatim also failed:", error);
      }
    }

    if (!coords) {
      coords = {
        lat: 16.0544 + (Math.random() - 0.5) * 0.1,
        lng: 108.2022 + (Math.random() - 0.5) * 0.1
      };
    }

    setSearchQuery(result.display);
    setTempCoords(coords);

    // Calculate distance and fee
    if (coords && unitPrice) {
      const distanceKm = calculateDistanceHaversine(SCHOOL_LOCATION, coords);
      setDistance(`${distanceKm.toFixed(1)} km`);
      setDuration("~30 mins");

      const singleTripFee = unitPrice.pricePerKm * distanceKm;
      setPerTripFee(singleTripFee);

      await calculateSemesterFee(distanceKm);
    }
  }, [unitPrice]);

  const calculateDistanceHaversine = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number => {
    const R = 6371;
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateSemesterFee = async (distanceKm: number) => {
    if (!distanceKm || distanceKm <= 0) return;

    try {
      setFeeCalculating(true);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/Transaction/calculate-fee`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ distanceKm: distanceKm })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSemesterFee(data.totalFee || 0);
      setTotalSchoolDays(data.semesterInfo?.totalSchoolDays || 0);
      setTotalTrips(data.semesterInfo?.totalTrips || 0);
    } catch (error) {
      console.error('Error calculating semester fee:', error);
    } finally {
      setFeeCalculating(false);
    }
  };

  const handleMapClick = useCallback((coords: { lat: number; lng: number }) => {
    setTempCoords(coords);

    // Calculate distance and fee
    if (unitPrice) {
      const distanceKm = calculateDistanceHaversine(SCHOOL_LOCATION, coords);
      setDistance(`${distanceKm.toFixed(1)} km`);
      setDuration("~30 mins");

      const singleTripFee = unitPrice.pricePerKm * distanceKm;
      setPerTripFee(singleTripFee);

      calculateSemesterFee(distanceKm);
    }
  }, [unitPrice]);

  const confirmPickupPoint = () => {
    if (tempCoords) {
      setSelectedCoords(tempCoords);
      setShowMap(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    if (!selectedCoords) {
      alert("Please select a pickup point on the map");
      return;
    }

    const submitData: ParentAccountData & PickupPointData = {
      ...formData,
      studentIds: selectedStudents.map(s => s.id),
      students: selectedStudents,
      selectedStudents,
      pickupPoint: {
        addressText: searchQuery || 'Selected location',
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        distanceKm: parseFloat(distance.replace(' km', '')) || 0,
      },
      feeCalculation: {
        perTripFee,
        semesterFee,
        totalSchoolDays,
        totalTrips,
      },
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Parent Information Section */}
      <div className="bg-[#F9F7E3] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Parent Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email*"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="First Name*"
            placeholder="Enter First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            error={errors.firstName}
            required
          />

          <Input
            label="Last Name*"
            placeholder="Enter Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            error={errors.lastName}
            required
          />

          <Input
            label="Phone Number*"
            placeholder="Enter Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            error={errors.phoneNumber}
            required
          />

          <Input
            label="Address*"
            placeholder="Enter Address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            error={errors.address}
            required
          />

          <Select
            label="Gender*"
            options={genderOptions}
            placeholder="Select Gender"
            value={formData.gender}
            onChange={(value) => handleInputChange("gender", value)}
            error={errors.gender}
            required
          />

          <Input
            label="Date of Birth*"
            type="date"
            placeholder="Select date of birth"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            error={errors.dateOfBirth}
            required
          />
        </div>
      </div>

      {/* Student Selection Section */}
      <div className="bg-[#F9F7E3] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Select Students ({selectedStudents.length} selected)
        </h3>

        {studentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC700] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading students...</p>
          </div>
        ) : studentsError ? (
          <div className="bg-red-100 border border-red-300 rounded-2xl p-4 text-red-600">
            {studentsError}
          </div>
        ) : unassignedStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No unassigned students available</p>
            <p className="text-sm mt-2">All students are already assigned to parents</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unassignedStudents.map((student) => {
              const isSelected = selectedStudents.some(s => s.id === student.id);
              return (
                <motion.div
                  key={student.id}
                  whileHover={{ scale: 1.01 }}
                  className={`
                    p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                    ${isSelected
                      ? 'border-[#FDC700] bg-[#FEFCE8] shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                  onClick={() => toggleStudentSelection(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                        ${isSelected
                          ? 'bg-[#FDC700] border-[#FDC700]'
                          : 'border-gray-300 bg-white'
                        }
                      `}>
                        {isSelected && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          ID: {student.id}
                        </p>
                      </div>
                    </div>

                    <div className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                      ${isSelected
                        ? 'bg-[#FDC700] text-white'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {isSelected ? 'Selected' : 'Click to Select'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pickup Point Selection Section */}
      <div className="bg-[#F9F7E3] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Pickup Point Location
        </h3>

        {!showMap ? (
          <div className="space-y-4">
            {selectedCoords ? (
              <div className="bg-green-50 border border-green-300 rounded-2xl p-4">
                <p className="text-green-700 font-semibold mb-2">✓ Pickup Point Selected</p>
                <p className="text-gray-700"><strong>Address:</strong> {searchQuery || 'Custom location'}</p>
                <p className="text-gray-700"><strong>Coordinates:</strong> {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}</p>
                <p className="text-gray-700"><strong>Distance:</strong> {distance}</p>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 px-6 rounded-2xl transition-all"
                >
                  Change Location
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📍 Select Pickup Point on Map
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                placeholder="Search for address..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#fad23c] focus:outline-none focus:ring-2 focus:ring-[#fad23c] text-lg bg-white shadow-lg"
                disabled={!isMapLoaded}
              />

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearchResultSelect(result)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                    >
                      <div className="font-medium text-gray-800">{result.display}</div>
                      <div className="text-sm text-gray-500">{result.address}</div>
                    </div>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#fad23c]"></div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border-2 border-[#FDC700]">
              <VietMapPageComponent
                onMapReady={() => setIsMapLoaded(true)}
                onMapClick={handleMapClick}
                onMarkerClick={() => {}}
                selectedCoords={selectedCoords}
                tempCoords={tempCoords}
                isRouting={false}
                travelMode="DRIVING"
                isLoading={!isMapLoaded}
                error={mapError}
                isMapLoaded={isMapLoaded}
                setIsMapLoaded={setIsMapLoaded}
                setError={setMapError}
                setIsLoading={() => {}}
                setIsRouting={() => {}}
                onRouteCalculated={(dist, dur) => {
                  setDistance(dist);
                  setDuration(dur);
                }}
                unitPrice={unitPrice?.pricePerKm || 7000}
              />
            </div>

            {/* Fee Display */}
            {tempCoords && distance && (
              <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-2xl p-6 border-2 border-[#FBD748]">
                <h4 className="text-lg font-bold text-[#463B3B] mb-4 text-center">Fee Calculation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-[#463B3B] opacity-70 mb-1">Per Trip</div>
                    <div className="text-2xl font-bold text-[#D08700]">
                      {perTripFee.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-[#463B3B] opacity-70 mb-1">Semester Total</div>
                    {feeCalculating ? (
                      <div className="text-lg text-[#463B3B]">Calculating...</div>
                    ) : (
                      <div className="text-2xl font-bold text-[#D08700]">
                        {semesterFee.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>
                </div>
                {totalSchoolDays > 0 && (
                  <div className="mt-4 text-center text-sm text-[#463B3B]">
                    {totalSchoolDays} school days • {totalTrips} trips • {distance}
                  </div>
                )}
              </div>
            )}

            {/* Confirm Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPickupPoint}
                disabled={!tempCoords}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Location
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading || selectedStudents.length === 0 || !selectedCoords}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold
                     py-3 px-8 rounded-2xl transition-all duration-300
                     transform hover:scale-105 shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Creating..." : "Create Parent Account"}
        </button>
      </div>
    </form>
  );
};

export default ParentAccountForm;
