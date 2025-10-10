"use client";
import { useState } from "react";
import { FaClock } from "react-icons/fa";

interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface TimeSlotSelectorProps {
  selectedStartTime: string;
  selectedEndTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  errors?: {
    startTime?: string;
    endTime?: string;
  };
}

// Predefined time slots for school bus schedules
const TIME_SLOTS: TimeSlot[] = [
  {
    id: "morning-pickup",
    label: "Morning Pickup",
    startTime: "06:00",
    endTime: "07:30",
    description: "Early morning pickup for students"
  },
  {
    id: "morning-pickup-late",
    label: "Morning Pickup (Late)",
    startTime: "07:00",
    endTime: "09:00",
    description: "Late morning pickup for students"
  },
  {
    id: "afternoon-dropoff",
    label: "Afternoon Drop-off",
    startTime: "17:00",
    endTime: "18:30",
    description: "Afternoon drop-off after school"
  },
  {
    id: "custom",
    label: "Custom Time",
    startTime: "",
    endTime: "",
    description: "Set custom start and end times"
  }
];

export default function TimeSlotSelector({
  selectedStartTime,
  selectedEndTime,
  onStartTimeChange,
  onEndTimeChange,
  errors = {}
}: TimeSlotSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot.id);
    
    if (slot.id === "custom") {
      setShowCustomInputs(true);
      // Don't change times for custom, let user input manually
    } else {
      setShowCustomInputs(false);
      onStartTimeChange(slot.startTime);
      onEndTimeChange(slot.endTime);
    }
  };

  const handleCustomTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (field === 'startTime') {
      onStartTimeChange(value);
    } else {
      onEndTimeChange(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Time Slot Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <FaClock className="inline w-4 h-4 mr-2" />
          Select Time Slot
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.id}
              onClick={() => handleSlotSelect(slot)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedSlot === slot.id
                  ? "border-[#FDC700] bg-yellow-50 shadow-lg"
                  : "border-gray-200 hover:border-[#FDC700] hover:shadow-md"
              }`}
            >
              <div className="flex flex-col">
                <h5 className="font-semibold text-gray-800 text-sm mb-1">
                  {slot.label}
                </h5>
                {slot.id !== "custom" && (
                  <p className="text-xs text-gray-600 mb-2">
                    {slot.startTime} - {slot.endTime}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {slot.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Time Inputs */}
      {showCustomInputs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Start Time *
            </label>
            <input
              type="time"
              value={selectedStartTime}
              onChange={(e) => handleCustomTimeChange('startTime', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                errors.startTime
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.startTime}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom End Time *
            </label>
            <input
              type="time"
              value={selectedEndTime}
              onChange={(e) => handleCustomTimeChange('endTime', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                errors.endTime
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.endTime}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      {selectedStartTime && selectedEndTime && !showCustomInputs && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected Time:</strong> {selectedStartTime} - {selectedEndTime}
          </p>
        </div>
      )}
    </div>
  );
}
