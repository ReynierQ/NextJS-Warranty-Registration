"use client";

import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  label: string;
}

const DatePicker = ({ name, value, onChange, required = false, label }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);
  const [inputValue, setInputValue] = useState(value ? formatDateForInput(value) : "");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function formatDateForInput(date: string) {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateString);
    setInputValue(formatDateForInput(dateString));
    onChange(name, dateString);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Only allow numbers and forward slashes
    value = value.replace(/[^\d/]/g, '');
    
    // Parse the current input
    const parts = value.split('/');
    
    // Validate and limit month (01-12)
    if (parts[0]) {
      let month = parts[0].replace(/\D/g, '');
      if (month.length === 1 && parseInt(month) > 1) {
        month = '0' + month;
        parts[0] = month;
      } else if (month.length === 2) {
        const monthNum = parseInt(month);
        if (monthNum > 12) {
          month = '12';
        } else if (monthNum < 1) {
          month = '01';
        }
        parts[0] = month;
      }
    }
    
    // Validate and limit day based on month
    if (parts[1] && parts[0]) {
      let day = parts[1].replace(/\D/g, '');
      const month = parseInt(parts[0]);
      
      // Get days in the selected month
      const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
      const daysInMonth = new Date(year, month, 0).getDate();
      
      if (day.length === 1 && parseInt(day) > 3) {
        day = '0' + day;
        parts[1] = day;
      } else if (day.length === 2) {
        const dayNum = parseInt(day);
        if (dayNum > daysInMonth) {
          day = String(daysInMonth).padStart(2, '0');
        } else if (dayNum < 1) {
          day = '01';
        }
        parts[1] = day;
      }
    }
    
    // Validate year (not in future)
    if (parts[2]) {
      let year = parts[2].replace(/\D/g, '');
      if (year.length === 4) {
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        if (yearNum > currentYear) {
          year = String(currentYear);
        } else if (yearNum < 1900) {
          year = '1900';
        }
        parts[2] = year;
      }
    }
    
    // Reconstruct the value
    value = parts.join('/');
    
    // Auto-insert slashes
    if (value.length === 2 && !value.includes('/')) {
      value = value + '/';
    } else if (value.length === 5 && value.split('/').length === 2) {
      value = value + '/';
    }
    
    // Limit to MM/DD/YYYY format
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    setInputValue(value);
    
    // Validate complete date
    if (value.length === 10 && parts.length === 3 && parts[2].length === 4) {
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      // Check if date is valid and not in future
      if (month >= 1 && month <= 12 && day >= 1 && year >= 1900) {
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(dateString);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        // Verify the date is valid and not in future
        if (!isNaN(dateObj.getTime()) && 
            dateObj <= today &&
            dateObj.getDate() === day && 
            dateObj.getMonth() + 1 === month && 
            dateObj.getFullYear() === year) {
          setSelectedDate(dateString);
          onChange(name, dateString);
          setCurrentMonth(dateObj);
        }
      }
    }
  };

  const handleInputBlur = () => {
    // If input is incomplete or invalid, revert to last valid date
    if (inputValue.length !== 10 && selectedDate) {
      setInputValue(formatDateForInput(selectedDate));
    } else if (!selectedDate && inputValue.length < 10) {
      setInputValue("");
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectMonth = (monthIndex: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setShowMonthPicker(false);
  };

  const selectYear = (year: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 1940;
    const endYear = currentYear;
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isFuture = currentDate > today;
      const isSelected = selectedDate && 
        new Date(selectedDate).getDate() === day &&
        new Date(selectedDate).getMonth() === currentMonth.getMonth() &&
        new Date(selectedDate).getFullYear() === currentMonth.getFullYear();
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isFuture && handleDateSelect(day)}
          disabled={isFuture}
          className={`text-center h-8 text-sm rounded transition-colors ${
            isFuture 
              ? 'text-gray-600 cursor-not-allowed' 
              : isSelected 
                ? 'bg-jbl-orange text-white' 
                : 'text-white hover:bg-orange-400 hover:text-white'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    if (value) {
      setInputValue(formatDateForInput(value));
      setSelectedDate(value);
    }
  }, [value]);

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-2 text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          placeholder="MM/DD/YYYY"
          className="w-full border border-white rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-black"
          maxLength={10}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-jbl-orange transition-colors"
        >
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {isOpen && (
  <div className="absolute top-full right-0 md:top-0 md:left-full md:ml-2 mt-1 md:mt-0 w-full md:w-80 bg-black rounded-lg shadow-lg border border-gray-200 z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-orange-400 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }}
                className="font-semibold text-white hover:text-white transition-colors px-2 py-1 rounded hover:bg-orange-400"
              >
                {months[currentMonth.getMonth()]}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }}
                className="font-semibold text-white hover:text-white transition-colors px-2 py-1 rounded hover:bg-orange-400"
              >
                {currentMonth.getFullYear()}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-orange-400 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {showMonthPicker && (
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => selectMonth(index)}
                    className={`p-2 text-sm rounded hover:bg-orange-400 hover:text-white transition-colors ${
                      currentMonth.getMonth() === index 
                        ? 'bg-jbl-orange text-white' 
                        : 'text-white hover:bg-orange-400'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showYearPicker && (
            <div className="mb-4">
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {generateYearRange().map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`p-2 text-sm rounded hover:bg-orange-400 hover:text-white transition-colors ${
                      currentMonth.getFullYear() === year 
                        ? 'bg-jbl-orange text-white' 
                        : 'text-white hover:bg-orange-400'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showMonthPicker && !showYearPicker && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-white py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                setSelectedDate(todayString);
                setInputValue(formatDateForInput(todayString));
                onChange(name, todayString);
                setCurrentMonth(today);
                setShowMonthPicker(false);
                setShowYearPicker(false);
              }}
              className="p-2 rounded text-sm text-white hover:bg-orange-400"
            >
              Today
            </button>
            {(showMonthPicker || showYearPicker) && (
              <button
                type="button"
                onClick={() => {
                  setShowMonthPicker(false);
                  setShowYearPicker(false);
                }}
                className="p-2 rounded text-sm text-white hover:bg-orange-400"
              >
                Back to Calendar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;