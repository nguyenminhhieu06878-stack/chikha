import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const TimeRangeSelector = ({ value, onChange, options, size = 'md' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultOptions = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '3m', label: '3 tháng qua' }
  ];

  const selectOptions = options || defaultOptions;
  const selectedOption = selectOptions.find(opt => opt.value === value) || selectOptions[0];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          bg-white border border-gray-300 rounded-lg
          flex items-center space-x-2
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
        `}
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {selectOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm
                    hover:bg-gray-50 transition-colors duration-150
                    ${value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeRangeSelector;