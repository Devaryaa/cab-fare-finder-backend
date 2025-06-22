import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Mock location data for India (major cities and landmarks)
const indianLocations = [
  { address: "Bengaluru, Karnataka, India", lat: 12.9716, lng: 77.5946, placeId: "bangalore" },
  { address: "Mumbai, Maharashtra, India", lat: 19.0760, lng: 72.8777, placeId: "mumbai" },
  { address: "Delhi, India", lat: 28.7041, lng: 77.1025, placeId: "delhi" },
  { address: "Hyderabad, Telangana, India", lat: 17.3850, lng: 78.4867, placeId: "hyderabad" },
  { address: "Chennai, Tamil Nadu, India", lat: 13.0827, lng: 80.2707, placeId: "chennai" },
  { address: "Pune, Maharashtra, India", lat: 18.5204, lng: 73.8567, placeId: "pune" },
  { address: "Ahmedabad, Gujarat, India", lat: 23.0225, lng: 72.5714, placeId: "ahmedabad" },
  { address: "Jaipur, Rajasthan, India", lat: 26.9124, lng: 75.7873, placeId: "jaipur" },
  { address: "Kochi, Kerala, India", lat: 9.9312, lng: 76.2673, placeId: "kochi" },
  { address: "Indira Gandhi International Airport, Delhi", lat: 28.5562, lng: 77.1000, placeId: "delhi-airport" },
  { address: "Kempegowda International Airport, Bengaluru", lat: 13.1979, lng: 77.7063, placeId: "bangalore-airport" },
  { address: "Chhatrapati Shivaji Maharaj International Airport, Mumbai", lat: 19.0896, lng: 72.8656, placeId: "mumbai-airport" },
  { address: "Electronic City, Bengaluru", lat: 12.8456, lng: 77.6603, placeId: "electronic-city" },
  { address: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7500, placeId: "whitefield" },
  { address: "Gurgaon, Haryana, India", lat: 28.4595, lng: 77.0266, placeId: "gurgaon" },
  { address: "Noida, Uttar Pradesh, India", lat: 28.5355, lng: 77.3910, placeId: "noida" },
  { address: "Koramangala, Bengaluru", lat: 12.9279, lng: 77.6271, placeId: "koramangala" },
  { address: "Bandra, Mumbai", lat: 19.0544, lng: 72.8406, placeId: "bandra" },
  { address: "Connaught Place, Delhi", lat: 28.6315, lng: 77.2167, placeId: "cp-delhi" },
  { address: "Hitech City, Hyderabad", lat: 17.4485, lng: 78.3908, placeId: "hitech-city" }
];

interface LocationData {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface SimpleLocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (location: LocationData | null) => void;
  icon?: React.ReactNode;
}

const SimpleLocationSearch = ({ placeholder, value, onChange, icon }: SimpleLocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    
    if (newValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    // Filter locations based on input
    const filtered = indianLocations.filter(location =>
      location.address.toLowerCase().includes(newValue.toLowerCase())
    ).slice(0, 5);
    
    setSuggestions(filtered);
    setShowSuggestions(true);
    setIsLoading(false);
  };

  const handleSelectSuggestion = (location: LocationData) => {
    setInputValue(location.address);
    setShowSuggestions(false);
    onChange(location);
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(null);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <div className="absolute left-3 top-3 text-gray-400">
          {icon || <MapPin className="h-4 w-4" />}
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-10 h-12 text-lg border-2 border-yellow-500 focus:border-yellow-400 transition-colors bg-black text-white placeholder:text-gray-400"
        />
        {isLoading && (
          <div className="absolute right-10 top-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="absolute right-2 top-1 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-black border border-yellow-500 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-800 border-b border-gray-700 last:border-b-0 focus:outline-none focus:bg-gray-800"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {suggestion.address.split(',')[0]}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {suggestion.address}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleLocationSearch;