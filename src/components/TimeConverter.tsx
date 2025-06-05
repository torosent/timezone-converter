'use client';

import React, { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { parse as chronoParse } from 'chrono-node';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Clock, Calendar, Globe, Copy, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';

// Initialize dayjs plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

interface ConversionResult {
  format: string;
  value: string;
  library: string;
}

const TimeConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
  }, []);

  // Update current time every second
  useEffect(() => {
    if (!isClient) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isClient]);

  // Re-parse when timezone changes
  useEffect(() => {
    if (!inputValue.trim()) return;
    
    setParseError(null);
    const parsedDate = parseInputDate(inputValue, timezone);
    if (parsedDate) {
      const conversions = convertDate(parsedDate);
      setResults(conversions);
    } else {
      setParseError('Unable to parse the input date/time. Try formats like "2023-12-25", "Dec 25, 2023", "tomorrow", or Unix timestamps.');
      setResults([]);
    }
  }, [timezone, inputValue]);

  // Show loading state on server-side rendering
  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Common date/time formats to convert to
  const outputFormats = [
    { name: 'ISO 8601', format: 'iso', example: '2023-12-25T10:30:00.000Z' },
    { name: 'RFC 2822', format: 'rfc2822', example: 'Mon, 25 Dec 2023 10:30:00 GMT' },
    { name: 'Unix Timestamp', format: 'unix', example: '1703505000' },
    { name: 'Unix Milliseconds', format: 'unixms', example: '1703505000000' },
    { name: 'Date Only', format: 'date', example: '2023-12-25' },
    { name: 'Time Only', format: 'time', example: '10:30:00' },
    { name: 'US Format', format: 'us', example: '12/25/2023 10:30 AM' },
    { name: 'European Format', format: 'eu', example: '25/12/2023 10:30' },
    { name: 'Relative', format: 'relative', example: '2 hours ago' },
    { name: 'Long Format', format: 'long', example: 'Monday, December 25, 2023 at 10:30 AM' },
  ];

  // Common timezones with short names (deduplicated and comprehensive)
  const timezones = [
    // UTC
    { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
    
    // North America - United States
    { value: 'America/New_York', label: 'EST/EDT - Eastern Time (US)' },
    { value: 'America/Chicago', label: 'CST/CDT - Central Time (US)' },
    { value: 'America/Denver', label: 'MST/MDT - Mountain Time (US)' },
    { value: 'America/Phoenix', label: 'MST - Mountain Time (Arizona)' },
    { value: 'America/Los_Angeles', label: 'PST/PDT - Pacific Time (US)' },
    { value: 'America/Anchorage', label: 'AKST/AKDT - Alaska Time' },
    { value: 'Pacific/Honolulu', label: 'HST - Hawaii Time' },
    
    // North America - Canada
    { value: 'America/Toronto', label: 'EST/EDT - Eastern Time (Canada)' },
    { value: 'America/Winnipeg', label: 'CST/CDT - Central Time (Canada)' },
    { value: 'America/Edmonton', label: 'MST/MDT - Mountain Time (Canada)' },
    { value: 'America/Vancouver', label: 'PST/PDT - Pacific Time (Canada)' },
    
    // Latin America
    { value: 'America/Mexico_City', label: 'CST/CDT - Central Time (Mexico)' },
    { value: 'America/Sao_Paulo', label: 'BRT/BRST - Brazil Time' },
    { value: 'America/Argentina/Buenos_Aires', label: 'ART - Argentina Time' },
    { value: 'America/Lima', label: 'PET - Peru Time' },
    { value: 'America/Caracas', label: 'VET - Venezuela Time' },
    
    // Europe
    { value: 'Europe/London', label: 'GMT/BST - Greenwich Mean Time' },
    { value: 'Europe/Dublin', label: 'GMT/IST - Ireland Time' },
    { value: 'Europe/Paris', label: 'CET/CEST - Central European Time' },
    { value: 'Europe/Rome', label: 'CET/CEST - Central European Time (Italy)' },
    { value: 'Europe/Amsterdam', label: 'CET/CEST - Central European Time (Netherlands)' },
    { value: 'Europe/Berlin', label: 'CET/CEST - Central European Time (Germany)' },
    { value: 'Europe/Stockholm', label: 'CET/CEST - Central European Time (Sweden)' },
    { value: 'Europe/Helsinki', label: 'EET/EEST - Eastern European Time' },
    { value: 'Europe/Athens', label: 'EET/EEST - Eastern European Time (Greece)' },
    { value: 'Europe/Moscow', label: 'MSK - Moscow Time' },
    { value: 'Europe/Istanbul', label: 'TRT - Turkey Time' },
    
    // Asia
    { value: 'Asia/Dubai', label: 'GST - Gulf Standard Time' },
    { value: 'Asia/Kolkata', label: 'IST - India Standard Time' },
    { value: 'Asia/Kathmandu', label: 'NPT - Nepal Time' },
    { value: 'Asia/Dhaka', label: 'BST - Bangladesh Time' },
    { value: 'Asia/Bangkok', label: 'ICT - Indochina Time' },
    { value: 'Asia/Singapore', label: 'SGT - Singapore Time' },
    { value: 'Asia/Shanghai', label: 'CST - China Standard Time' },
    { value: 'Asia/Hong_Kong', label: 'HKT - Hong Kong Time' },
    { value: 'Asia/Taipei', label: 'CST - Taiwan Time' },
    { value: 'Asia/Tokyo', label: 'JST - Japan Standard Time' },
    { value: 'Asia/Seoul', label: 'KST - Korea Standard Time' },
    { value: 'Asia/Jakarta', label: 'WIB - Western Indonesia Time' },
    
    // Australia & Oceania
    { value: 'Australia/Perth', label: 'AWST - Australian Western Time' },
    { value: 'Australia/Adelaide', label: 'ACST/ACDT - Australian Central Time' },
    { value: 'Australia/Sydney', label: 'AEST/AEDT - Australian Eastern Time' },
    { value: 'Pacific/Auckland', label: 'NZST/NZDT - New Zealand Time' },
    { value: 'Pacific/Fiji', label: 'FJT - Fiji Time' },
    
    // Africa
    { value: 'Africa/Lagos', label: 'WAT - West Africa Time' },
    { value: 'Africa/Cairo', label: 'EET - Eastern European Time (Egypt)' },
    { value: 'Africa/Johannesburg', label: 'SAST - South Africa Time' },
    { value: 'Africa/Nairobi', label: 'EAT - East Africa Time' }
  ];

  const parseInputDate = (input: string, inputTimezone: string = timezone): Date | null => {
    if (!input.trim()) return null;

    try {
      // Try parsing with chrono-node (natural language parsing)
      const chronoResults = chronoParse(input);
      if (chronoResults.length > 0) {
        const parsedDate = chronoResults[0].start.date();
        // If the input doesn't already have timezone info, treat it as being in the selected timezone
        if (inputTimezone !== 'UTC' && !chronoResults[0].start.isCertain('timezoneOffset')) {
          const zonedDate = moment.tz(moment(parsedDate).format('YYYY-MM-DD HH:mm:ss'), inputTimezone);
          return zonedDate.toDate();
        }
        return parsedDate;
      }

      // Try common formats with moment in the selected timezone
      const momentFormats = [
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DD HH:mm',
        'YYYY-MM-DD',
        'MM/DD/YYYY HH:mm:ss',
        'MM/DD/YYYY HH:mm',
        'MM/DD/YYYY',
        'DD/MM/YYYY HH:mm:ss',
        'DD/MM/YYYY HH:mm',
        'DD/MM/YYYY',
        'YYYY-MM-DDTHH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSS',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        'ddd MMM DD YYYY HH:mm:ss',
        'MMM DD, YYYY HH:mm:ss',
        'MMM DD, YYYY',
      ];

      for (const fmt of momentFormats) {
        // Try to parse as timezone-aware if the format doesn't include timezone info
        if (!fmt.includes('Z') && inputTimezone !== 'UTC') {
          const momentDate = moment.tz(input, fmt, inputTimezone);
          if (momentDate.isValid()) {
            return momentDate.toDate();
          }
        }
        
        // Fallback to regular parsing
        const momentDate = moment(input, fmt, true);
        if (momentDate.isValid()) {
          return momentDate.toDate();
        }
      }

      // Try parsing as Unix timestamp (timestamps are always UTC)
      const unixTimestamp = parseInt(input);
      if (!isNaN(unixTimestamp)) {
        // Check if it's seconds or milliseconds
        const date = unixTimestamp > 1e10 ? new Date(unixTimestamp) : new Date(unixTimestamp * 1000);
        if (isValid(date)) {
          return date;
        }
      }

      // Try native Date parsing as last resort
      const nativeDate = new Date(input);
      if (isValid(nativeDate)) {
        return nativeDate;
      }

      return null;
    } catch {
      return null;
    }
  };

  const convertDate = (date: Date): ConversionResult[] => {
    const results: ConversionResult[] = [];

    try {
      // Convert to different formats
      const momentDate = moment(date);

      outputFormats.forEach(({ name, format: fmt }) => {
        try {
          let value = '';
          let library = '';

          switch (fmt) {
            case 'iso':
              value = date.toISOString();
              library = 'Native JS';
              break;
            case 'rfc2822':
              value = momentDate.format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
              library = 'Moment.js';
              break;
            case 'unix':
              value = Math.floor(date.getTime() / 1000).toString();
              library = 'Native JS';
              break;
            case 'unixms':
              value = date.getTime().toString();
              library = 'Native JS';
              break;
            case 'date':
              value = format(date, 'yyyy-MM-dd');
              library = 'date-fns';
              break;
            case 'time':
              value = format(date, 'HH:mm:ss');
              library = 'date-fns';
              break;
            case 'us':
              value = format(date, 'MM/dd/yyyy hh:mm a');
              library = 'date-fns';
              break;
            case 'eu':
              value = format(date, 'dd/MM/yyyy HH:mm');
              library = 'date-fns';
              break;
            case 'relative':
              value = momentDate.fromNow();
              library = 'Moment.js';
              break;
            case 'long':
              value = format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
              library = 'date-fns';
              break;
            default:
              value = date.toString();
              library = 'Native JS';
          }

          results.push({
            format: name,
            value,
            library
          });
        } catch {
          // Skip formats that fail
        }
      });
    } catch {
      // Handle conversion errors
    }

    return results;
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setParseError(null);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    const parsedDate = parseInputDate(value, timezone);
    if (parsedDate) {
      const conversions = convertDate(parsedDate);
      setResults(conversions);
    } else {
      setParseError('Unable to parse the input date/time. Try formats like "2023-12-25", "Dec 25, 2023", "tomorrow", or Unix timestamps.');
      setResults([]);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const insertCurrentTime = () => {
    if (!currentTime) return;
    setInputValue(currentTime.toISOString());
    handleInputChange(currentTime.toISOString());
  };

  const clearInput = () => {
    setInputValue('');
    setResults([]);
    setParseError(null);
  };

  const sampleInputs = [
    'now',
    'tomorrow at 3pm',
    '2023-12-25T10:30:00Z',
    '1703505000',
    'Dec 25, 2023',
    'next friday',
    '25/12/2023 14:30',
    'in 2 hours',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Input Date/Time
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date/Time Input
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter any date/time format... (e.g., 'now', '2023-12-25', 'tomorrow at 3pm')"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute right-2 top-9 flex gap-1">
                <button
                  onClick={insertCurrentTime}
                  disabled={!currentTime}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Insert current time"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={clearInput}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear input"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="lg:w-64 w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Input Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sample inputs */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Try:</span>
            {sampleInputs.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleInputChange(sample)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Current time display */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">Current time: {currentTime?.toLocaleString() || 'Loading...'}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {parseError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{parseError}</p>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <>
                  {/* Timezone Display */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Time in Different Timezones
              </h2>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {timezones.slice(0, 15).map((tz, index) => {
                const parsedDate = parseInputDate(inputValue, timezone);
                if (!parsedDate) return null;
                
                try {
                  const zonedDate = toZonedTime(parsedDate, tz.value);
                  const formattedTime = format(zonedDate, 'yyyy-MM-dd HH:mm:ss zzz');
                  
                  return (
                    <div
                      key={tz.value}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                          {tz.label}
                        </div>
                        <code className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-all">
                          {formattedTime}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formattedTime, index + 1000)}
                        className="self-end sm:self-center sm:ml-2 p-2 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index + 1000 ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                } catch {
                  return null;
                }
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Converted Formats
              </h2>
            </div>
            
            <div className="grid gap-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {result.format}
                      </span>
                    </div>
                    <code className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-all block">
                      {result.value}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.value, index)}
                    className="self-end sm:self-center sm:ml-2 p-2 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          How to Use:
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>• <strong>Input Timezone:</strong> Select the timezone your input time is in. This affects how your input is interpreted.</p>
          <p>• <strong>Supported formats:</strong> Natural language (&ldquo;now&rdquo;, &ldquo;tomorrow&rdquo;), ISO 8601, common date formats, Unix timestamps</p>
          <p>• <strong>Examples:</strong> &ldquo;2023-12-25 14:30&rdquo;, &ldquo;Dec 25, 2023&rdquo;, &ldquo;next friday&rdquo;, &ldquo;1703505000&rdquo;</p>
          <p>• <strong>Time conversion:</strong> All formats and timezones are automatically calculated from your input</p>
        </div>
      </div>
    </div>
  );
};

export default TimeConverter;
