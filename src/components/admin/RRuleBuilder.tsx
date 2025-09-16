"use client";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaCog,
  FaEye,
  FaCheck,
  FaTimes,
  FaGraduationCap,
  FaPlay,
} from "react-icons/fa";
import {
  RRuleConfig,
  RRulePattern,
  ACADEMIC_RRULE_PATTERNS,
  DAY_NAMES,
  MONTH_NAMES,
  RRuleUtils,
} from "@/utils/rruleUtils";

interface RRuleBuilderProps {
  value: string;
  onChange: (rrule: string) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  className?: string;
}

export default function RRuleBuilder({
  value,
  onChange,
  onValidationChange,
  className = "",
}: RRuleBuilderProps) {
  const [config, setConfig] = useState<RRuleConfig>({
    frequency: "DAILY",
    interval: 1,
  });
  const [selectedPattern, setSelectedPattern] = useState<RRulePattern | null>(
    null
  );
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDates, setPreviewDates] = useState<Date[]>([]);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  // Parse initial RRule value
  useEffect(() => {
    if (value) {
      const parsed = RRuleUtils.parseRRule(value);
      if (parsed.isValid) {
        setConfig(parsed.config);

        // Check if it matches a predefined pattern
        const pattern = RRuleUtils.getPatternByRRule(value);
        if (pattern) {
          setSelectedPattern(pattern);
          setIsCustomMode(false);
        } else {
          setIsCustomMode(true);
        }
      }
    }
  }, [value]);

  // Update validation when config changes
  useEffect(() => {
    const rrule = RRuleUtils.buildRRule(config);
    const validation = RRuleUtils.validateRRule(rrule);
    setValidation(validation);
    onValidationChange?.(validation.isValid, validation.errors);
  }, [config, onValidationChange]);

  // Generate preview dates
  const generatePreview = () => {
    const rrule = RRuleUtils.buildRRule(config);
    const dates = RRuleUtils.generatePreviewDates(rrule, new Date(), 10);
    setPreviewDates(dates);
    setShowPreview(true);
  };

  // Handle pattern selection
  const handlePatternSelect = (pattern: RRulePattern) => {
    setSelectedPattern(pattern);
    setIsCustomMode(false);

    const parsed = RRuleUtils.parseRRule(pattern.rrule);
    if (parsed.isValid) {
      setConfig(parsed.config);
      onChange(pattern.rrule);
    }
  };

  // Handle custom mode toggle
  const handleCustomModeToggle = () => {
    setIsCustomMode(!isCustomMode);
    if (!isCustomMode) {
      setSelectedPattern(null);
    }
  };

  // Handle config changes
  const handleConfigChange = (updates: Partial<RRuleConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    const rrule = RRuleUtils.buildRRule(newConfig);
    onChange(rrule);
  };

  // Handle day selection
  const handleDayToggle = (day: string) => {
    const currentDays = config.byDay || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    handleConfigChange({ byDay: newDays.length > 0 ? newDays : undefined });
  };

  // Handle month selection
  const handleMonthToggle = (month: number) => {
    const currentMonths = config.byMonth || [];
    const newMonths = currentMonths.includes(month)
      ? currentMonths.filter((m) => m !== month)
      : [...currentMonths, month];

    handleConfigChange({
      byMonth: newMonths.length > 0 ? newMonths : undefined,
    });
  };

  // Handle month day selection
  const handleMonthDayToggle = (day: number) => {
    const currentDays = config.byMonthDay || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    handleConfigChange({
      byMonthDay: newDays.length > 0 ? newDays : undefined,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pattern Selection */}
      {!isCustomMode && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaGraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            Select Schedule Pattern
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACADEMIC_RRULE_PATTERNS.map((pattern) => (
              <div
                key={pattern.id}
                onClick={() => handlePatternSelect(pattern)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedPattern?.id === pattern.id
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{pattern.icon}</span>
                      <h5 className="font-semibold text-gray-800">
                        {pattern.name}
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {pattern.description}
                    </p>
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {pattern.rrule}
                    </div>
                  </div>
                  {selectedPattern?.id === pattern.id && (
                    <FaCheck className="w-5 h-5 text-blue-600 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleCustomModeToggle}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center mx-auto"
            >
              <FaCog className="w-4 h-4 mr-2" />
              Advanced Customization
            </button>
          </div>
        </div>
      )}

      {/* Custom Configuration */}
      {isCustomMode && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaCog className="w-5 h-5 mr-2 text-blue-600" />
              Custom Configuration
            </h4>
            <button
              onClick={handleCustomModeToggle}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            {/* Frequency and Interval */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Frequency
                </label>
                <select
                  value={config.frequency}
                  onChange={(e) =>
                    handleConfigChange({
                      frequency: e.target.value as RRuleConfig["frequency"],
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline w-4 h-4 mr-2" />
                  Interval
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={config.interval}
                  onChange={(e) =>
                    handleConfigChange({
                      interval: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Weekly Options */}
            {config.frequency === "WEEKLY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Days of Week
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(DAY_NAMES).map(([key, day]) => (
                    <button
                      key={key}
                      onClick={() => handleDayToggle(key)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        config.byDay?.includes(key)
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div>{day.short}</div>
                      <div className="text-xs opacity-75">{day.long}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Options */}
            {config.frequency === "MONTHLY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Days of Month
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => handleMonthDayToggle(day)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        config.byMonthDay?.includes(day)
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Yearly Options */}
            {config.frequency === "YEARLY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Months of Year
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.entries(MONTH_NAMES).map(([month, name]) => (
                    <button
                      key={month}
                      onClick={() => handleMonthToggle(parseInt(month))}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        config.byMonth?.includes(parseInt(month))
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Until Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={
                  config.until ? config.until.toISOString().split("T")[0] : ""
                }
                onChange={(e) =>
                  handleConfigChange({
                    until: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h5 className="font-semibold text-red-800 mb-2">
            Configuration Errors:
          </h5>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Description and Preview */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-semibold text-blue-800">Schedule Description:</h5>
          <button
            onClick={generatePreview}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
          >
            <FaEye className="w-4 h-4 mr-2" />
            Preview
          </button>
        </div>

        <p className="text-blue-700 mb-3">
          {RRuleUtils.getDescription(config)}
        </p>

        <div className="text-sm text-blue-600 font-mono bg-blue-100 px-3 py-2 rounded">
          {RRuleUtils.buildRRule(config)}
        </div>
      </div>

      {/* Preview Dates */}
      {showPreview && previewDates.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h5 className="font-semibold text-green-800 mb-3 flex items-center">
            <FaPlay className="w-4 h-4 mr-2" />
            Preview Next 10 Days:
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {previewDates.map((date, index) => (
              <div
                key={index}
                className="bg-white border border-green-200 rounded-lg p-2 text-center text-sm"
              >
                <div className="font-medium text-green-800">
                  {date.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </div>
                <div className="text-green-600">
                  {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
