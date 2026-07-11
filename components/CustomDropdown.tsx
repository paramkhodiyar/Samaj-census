'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  disabled = false,
  required = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Filter options based on search term
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected option label
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search term when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-left cursor-pointer ${
          disabled 
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
            : isOpen 
              ? 'border-[#8B5E3C] shadow-sm' 
              : 'border-[#E5DDD0] text-[#2D2D2D]'
        }`}
      >
        <span className={!selectedOption ? 'text-gray-400' : 'font-medium'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#B08968] transition-transform ${isOpen ? 'rotate-185' : ''}`} />
      </button>

      {/* Required field helper input for forms */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          required
          className="absolute opacity-0 pointer-events-none w-full bottom-0 left-0 h-0"
        />
      )}

      {/* Dropdown Options Popup */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5DDD0] rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Box */}
          {searchable && (
            <div className="sticky top-0 bg-white p-2 border-b border-[#FAF7F2] flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-400 ml-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs p-1 focus:outline-none bg-transparent"
              />
            </div>
          )}

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-xs text-gray-400 italic">No options found</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${
                    value === opt.value
                      ? 'bg-[#FAF7F2] text-[#8B5E3C] font-semibold'
                      : 'text-[#6A5B4D] hover:bg-[#FAF7F2]/50 hover:text-[#8B5E3C]'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
