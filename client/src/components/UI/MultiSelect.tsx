import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  name?: string;
  options: Option[];
  value?: string[];
  onChange?: (selectedValues: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  maxHeight?: string;
}

export function MultiSelect({
  label,
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  error,
  required = false,
  className = '',
  maxHeight = '200px',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  const selectedLabels = value
    .map((val) => options.find((opt) => opt.value === val)?.label)
    .filter(Boolean);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white cursor-pointer min-h-[42px] flex items-center flex-wrap gap-1 ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
      >
        {selectedLabels.length === 0 ? (
          <span className="text-gray-500 text-xs sm:text-sm">{placeholder}</span>
        ) : (
          selectedLabels.map((label, idx) => {
            const optionValue = options.find((opt) => opt.label === label)?.value;
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-md max-w-full"
              >
                <span className="truncate max-w-[120px] sm:max-w-none">{label}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemove(optionValue!, e)}
                  className="hover:bg-blue-200 rounded-full p-0.5 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-500 ml-auto transition-transform flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ maxHeight }}
        >
          {/* Search input */}
          <div className="p-2 sm:p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 60px)` }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 text-center">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className={`px-3 sm:px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs sm:text-sm text-gray-700 break-words">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected count */}
          {value.length > 0 && (
            <div className="px-3 sm:px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              {value.length} {value.length === 1 ? 'interest' : 'interests'} selected
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

